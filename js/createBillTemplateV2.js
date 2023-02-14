const path = require('path')
const fs = require('fs')
const { access, constants } = require('fs')
const uppercamelcase = require('uppercamelcase')
const render = require('json-templater/string')
const json = require('./template.js')
// 命令输入
const { prompt } = require('enquirer')
const { formConfig } = require('./template')
const dayjs = require('dayjs')

const API_PATH = path.join(__dirname, `../../src/api/bills/billApi.js`) // API路径

let componentname = '' // 组件名
let targetPath = '' // 目标路径
let pageKey = '' // 根据目标路径生成pageKey
let apiPath = '' // 根据目标路径生成pageKey

// 表单生成模板
const FORM_CONFIG = `
export const formData = {{formData}}

export const FormItems = {{formItems}}
`
// 表格生成模板
const TABLE_CONFIG = `
import { COLUMN_WIDTH_NORMAL } from '@/config/common'
export const TableColumns = {{tableColumns}}
`

// 不能里面不能再用模板字符串了，因此需要获取在外层获取到APP_KEY
// vue文件生成模板
const BILL_TEMPLATE = `
<template>
  <s-table-layout :page-key="pageKey" class="table-layout-box">
    <template #form>
      <z-form ref="formData" :model="formData" label-width="80px">
        <s-form-items :configs="formItems" :form-data="formData" :isExpanded="{{showExpand}}" :col="4" @search="onSearch">
        </s-form-items>
      </z-form>
    </template>

    <template #op-btn>
      <s-operate-buttons type="primary" :btns="outerBtns" />
    </template>

    <template #table>
      <s-table
        ref="fTable"
        :show-operation="{{showOperation}}"
        :show-fixed="{{showFixed}}"
        :show-index="{{showIndex}}"
        :show-checkbox="{{showCheckbox}}"
        :no-pager="{{noPager}}"
        :columns="config"
        :data.sync="tableData"
        :adapter="tableAjax"
        use-virtual
        operation-width="{{operationWidth}}"
      >
      </s-table>
    </template>
    <!-- 导出 -->
    <hy-export ref="hyExport" :mode="2"></hy-export>
  </s-table-layout>
</template>

<script>
import { APP_KEY } from '@/config/common.js'
import { FormItems, formData } from './config/form'
import { TableColumns } from './config/table'
import HyExport from '@/modules/base/hyExport'
import { cloneDeep } from 'lodash'
import { formatParam } from '@/utils/util'
import { query{{upperName}}Api } from '@/api/bills/billApi.js'
import dayjs from "dayjs"
export default {
  name: '{{upperName}}',
  components: { HyExport },
  data() {
    return {
      APP_KEY,
      formData: cloneDeep(formData),
      formItems: FormItems,
      config: cloneDeep(TableColumns),
      tableData: [],
      optionsClone: {},
      outerBtns: {{outerBtns}},
    }
  },
  computed: {
    pageKey() {
      return APP_KEY + '-{{pageKey}}'
    }
  },
  methods: {
    onSearch(resetPage) {
      this.$refs.fTable && this.$refs.fTable.fetchData(resetPage)
    },

    async tableAjax(pager) {
      const { pageSize, pageNum } = pager

      const form = cloneDeep(this.formData)

      const params = formatParam({
        ...form,
        pageSize,
        currentPage: pageNum
      })
      this.optionsClone = cloneDeep(params)

      const result = await query{{upperName}}Api(params)
      if (result.status) {
        return { rows: result.result.list || [], total: result.result.totalRow }
      }

      return { rows: [], total: 0 }
    },
    {{exportFn}}
  }
}
</script>

<style lang="scss" scoped></style>

`

// json生成模板
// const JSON_TEMPLATE = `
//   {
//     "pageConfig": {
//       "pageKey": "{{pageKey}}"
//     },
//     "formConfig": {
//       "formItems": [],
//       "formData": {}
//     },
//     "tableConfig": {
//       "columns": [],
//       "tableData": [],
//       "showOperation": true,
//       "operationPosition": "right",
//       "operationWidth": "auto",
//       "showExpand": false,
//       "showFixed": false,
//       "showIndex": true,
//       "showCheckbox": false,
//       "noPager": false
//     },
//     "isImportExport": false
//   }

//   `

// choices: ['hy-all-center', 'hy-all-site', 'hy-bills-codes', 'hy-manage-area', 'hy-manage-area']

const questions = [
  {
    type: 'input',
    name: 'componentName',
    message: '请输入组件名:'
  },
  {
    type: 'input',
    name: 'targetPath',
    message: '请输入相对路径（相对于项目的路径）:'
  },
  {
    type: 'input',
    name: 'pageKey',
    message: '请确认是否修改pageKey?',
    initial: function(val) {
      const answers = val.state.answers
      return generatorPageKey(answers.targetPath, answers.componentName)
    }
  },
  {
    type: 'input',
    name: 'queryApi',
    message: '请输入查询api地址:'
  }
]

// 这边就不生成模板了，生成一个json文件
async function main() {
  const response = await prompt(questions)
  componentname = response.componentName
  console.log(response)
  // 解析path
  targetPath = response.targetPath
  pageKey = response.pageKey
  apiPath = response.queryApi

  const ComponentName = uppercamelcase(componentname)

  const OUTPUT_PATH = path.join(__dirname, `../../${targetPath}/`) // 通用路径
  const FORM_FILE_PATH = `${OUTPUT_PATH}/${componentname}/config/form.js`
  const TABLE_FILE_PATH = `${OUTPUT_PATH}/${componentname}/config/table.js`
  const VUE_FILE_PATH = `${OUTPUT_PATH}/${componentname}/index.vue`
  const JSON_FILE_PATH = `${OUTPUT_PATH}/${componentname}/index.json`
  /**
   * 1.读取传入得文件名，作为name得配置，s-table-layout pageKey配置，pageKey不能完全读取，
   * 需要读取从views开始得目录，然后按照"-"进行连接
   * 2.生成到指定目录，按照路径进行拼接
   * 3.根据命令生成配置文件，根据配置文件渲染页面，读取配置，生成页面
   *  3.1需要生成的内容有哪些？表单内容
   *  3.2初始化组件后如何进行值绑定，是否我生成一个模板json现成的模板，然后在此基础上进行修改
   *
   *  查找动态路由生成的地方在哪儿？在处理到组件如果是个json文件时用一个插件来将json文件解析成vue文件
   */

  // 判断是否存在billApi这个文件，存在的话追加，不存在的话新建
  let API_TEMPLATE = ''
  const res = await checkFileExits(API_PATH)
  if (res.isExits) {
    // 读取billApi文件的内容
    const apiFile = fs.readFileSync(path.resolve(__dirname, API_PATH), 'utf8')
    // apiTemplate需要拼接
    API_TEMPLATE =
      apiFile +
      `export function query{{componentName}}Api(data) {
    return request({
      url: HostName + '/{{apiPath}}',
      method: 'post',
      data
    })
  }
    `
  } else {
    API_TEMPLATE = `
import request from '@/utils/request'
import { HostName } from '@/config/env'

export function query{{componentName}}Api(data) {
  return request({
    url: HostName + '/{{apiPath}}',
    method: 'post',
    data
  })
}
    `
  }
  const { tableConfig, formConfig, isExport } = json
  // 生成模板-form
  const formTemplate = render(FORM_CONFIG, {
    formData: JSON.stringify(formConfig.formData),
    formItems: JSON.stringify(formConfig.formItems)
  })
  // 生成模板-table
  const tableTemplate = render(TABLE_CONFIG, {
    tableColumns: JSON.stringify(tableConfig.columns)
  })

  const start = `${dayjs().format('YYYY-MM-DD')} 00:00:00`
  const end = `${dayjs().format('YYYY-MM-DD')} 00:00:00`
  // 生成模板-vue 文件
  const template = render(BILL_TEMPLATE, {
    componentName: componentname,
    upperName: ComponentName,
    pageKey: pageKey,
    showExpand: formConfig.showExpand,
    showOperation: tableConfig.showOperation,
    operationWidth: tableConfig.operationWidth,
    showFixed: tableConfig.showFixed,
    showIndex: tableConfig.showIndex,
    showCheckbox: tableConfig.showCheckbox,
    noPager: tableConfig.noPager,
    exportFn: isExport
      ? `
    handleExport() {
      const params = {
        firstMenuName: '', // 一级菜单名称   必传
        tabMenuName: '', // tab名称  必传
        menuKey: '', // 唯一key  必传
        asyncUrl: '',
        zop: 'hy-site', // 接口请求头   默认hy-manage  非必传
        columns: this.config.map(res => ({ ...res, name: res.prop, displayName: res.label })), // 导出列 必传
        optionsClone: {
          ...this.optionsClone
        }, // 查询条件  必传
        asyncParams: {
          // 异步导出需要的参数
          type: 2, // 1按时间切片  2自定义切片
          currentPage: 1,
          pageSize: 2000,
          billType: 1,
          start: \`\${dayjs().format('YYYY-MM-DD')} 00:00:00\`,
          end: \`\${dayjs().format('YYYY-MM-DD')} 00:00:00\`,
          serviceGroup: 'huiyan-site',
          serviceVersion: '1.0.0',
          interfaceClassName: ''
        }
      }
      this.$refs.hyExport.export(params)
    },`
      : '',
    outerBtns: isExport
      ? JSON.stringify([
          {
            id: 'export',
            label: '导出',
            onClick: this.exportData
          }
        ])
      : JSON.stringify([])
  })

  const apiTemplate = render(API_TEMPLATE, {
    apiPath: apiPath,
    componentName: ComponentName
  })

  // const jsonTemplate = render(JSON_TEMPLATE, {
  //   pageKey: pageKey
  // })

  try {
    // 创建文件夹
    fs.mkdir(`${OUTPUT_PATH}/${ComponentName}`, { recursive: true }, err => {
      if (err) throw err
      // 创建文件
    })
  } catch (err) {
    console.error(err.message)
  }

  // 创建账单文件夹成功
  mkDir(`${OUTPUT_PATH}/${componentname}`).then(res => {
    if (res.status) {
      // 创建config文件夹和配置文件
      mkDir(`${OUTPUT_PATH}/${componentname}/config`).then(configRes => {
        if (configRes.status) {
          // 创建form.js文件
          fs.writeFileSync(FORM_FILE_PATH, formTemplate)
          // 创建table.js文件
          fs.writeFileSync(TABLE_FILE_PATH, tableTemplate)
          // 创建index.vue文件
          fs.writeFileSync(VUE_FILE_PATH, template)
          // 创建billApi.js文件，模板需要读取原有的信息，然后进行追加
          // fs.writeFileSync(API_PATH, apiTemplate)
          // // 创建配置json文件
          // fs.writeFileSync(JSON_FILE_PATH, jsonTemplate)
        }
      })
    }
  })
}

// 执行输入
main()

function mkDir(path) {
  return new Promise((resolve, reject) => {
    try {
      // 创建文件夹
      fs.mkdir(path, { recursive: true }, err => {
        if (err) throw err
        resolve({
          status: true,
          meg: '创建文件夹成功！！！'
        })
      })
    } catch (err) {
      console.error(err.message)
    }
  })
}

// 生成pageKey
function generatorPageKey(path, componentname) {
  // 根据path生成pageKey，复制相对路径，截取views下的
  const pathArr = path.split('\\').slice(2)
  return pathArr.join('-') + '-' + componentname
}

function checkFileExits(path) {
  return new Promise((resolve, reject) => {
    access(path, constants.F_OK, err => {
      if (err) {
        resolve({
          isExits: false
        })
      }
      resolve({
        isExits: true
      })
    })
  })
}
