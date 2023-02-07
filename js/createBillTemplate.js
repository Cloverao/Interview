const path = require('path')
const fs = require('fs')
const { access, constants } = require('fs')
const fileSave = require('file-saver')
const uppercamelcase = require('uppercamelcase')
const render = require('json-templater/string')
// 命令输入
const { prompt } = require('enquirer')

const API_PATH = path.join(__dirname, `../../src/api/bills/billApi.js`) // API路径

let componentname = '' // 组件名
let targetPath = '' // 目标路径
let pageKey = '' // 根据目标路径生成pageKey
let apiPath = '' // 根据目标路径生成pageKey

const questions = [
  {
    type: 'input',
    name: 'componentName',
    message: '请输入组件名：'
  },
  {
    type: 'input',
    name: 'targetPath',
    message: '请输入相对路径（相对于项目的路径）：'
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
    message: '请输入查询api地址：'
  }
]

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
  const FORM_FILE_PATH = `${OUTPUT_PATH}/${ComponentName}/config/form.js`
  const TABLE_FILE_PATH = `${OUTPUT_PATH}/${ComponentName}/config/table.js`
  const VUE_FILE_PATH = `${OUTPUT_PATH}/${ComponentName}/index.vue`

  /**
   * 1.读取传入得文件名，作为name得配置，s-table-layout pageKey配置，pageKey不能完全读取，
   * 需要读取从views开始得目录，然后按照"-"进行连接
   * 2.生成到指定目录，按照路径进行拼接
   * 3.生成配置json，根据配置文件生成页面并且渲染
   */

  // 表单生成模板
  const FORM_CONFIG = `
export const formData = {
  foo: ''
}

export const FormItems = [
  {
    label: 'foo',
    prop: 'foo',
    itemType: 'input'
  }
]

`

  // 表格生成模板
  const TABLE_CONFIG = `
import { COLUMN_WIDTH_NORMAL } from '@/config/common'
export const TableColumns = [
  {
    label: '日期',
    prop: 'dateStr',
    width: COLUMN_WIDTH_NORMAL
  }
]

`

  // 不能里面不能再用模板字符串了，因此需要获取在外层获取到APP_KEY
  // vue文件生成模板
  const BILL_TEMPLATE = `
<template>
  <s-table-layout :page-key="pageKey" class="table-layout-box">
    <template #form>
      <z-form ref="formData" :model="formData" label-width="80px">
        <s-form-items :configs="formItems" :form-data="formData" :isExpanded="true" :col="4" @search="onSearch">
        </s-form-items>
      </z-form>
    </template>

    <template #op-btn>
      <s-operate-buttons type="primary" :btns="outerBtns" />
    </template>

    <template #table>
      <s-table
        ref="fTable"
        :show-operation="true"
        :show-fixed="false"
        :columns="config"
        :data.sync="tableData"
        :adapter="tableAjax"
        use-virtual
        operation-width="120px"
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
      outerBtns: []
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
    }
  }
}
</script>

<style lang="scss" scoped></style>

`

  // 判断是否存在billApi这个文件，存在的话追加，不存在的话新建
  let API_TEMPLATE = ''
  const res = await checkFileExits(API_PATH)
  if (res.isExits) {
    // 读取billApi文件的内容
    const apiFile = fs.readFileSync(path.resolve(__dirname, API_PATH), 'utf8')
    // apiTemplate需要拼接
    API_TEMPLATE =
      apiFile +
      `
  export function query{{componentName}}Api(data) {
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

  // 生成模板
  const template = render(BILL_TEMPLATE, {
    componentName: componentname,
    upperName: ComponentName,
    pageKey: pageKey
  })

  const apiTemplate = render(API_TEMPLATE, {
    apiPath: apiPath,
    componentName: ComponentName
  })
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
  mkDir(`${OUTPUT_PATH}/${ComponentName}`).then(res => {
    if (res.status) {
      // 创建config文件夹和配置文件
      mkDir(`${OUTPUT_PATH}/${ComponentName}/config`).then(configRes => {
        if (configRes.status) {
          // 创建form.js文件
          fs.writeFileSync(FORM_FILE_PATH, FORM_CONFIG)
          // 创建table.js文件
          fs.writeFileSync(TABLE_FILE_PATH, TABLE_CONFIG)
          // 创建index.vue文件
          fs.writeFileSync(VUE_FILE_PATH, template)

          // 创建billApi.js文件，模板需要读取原有的信息，然后进行追加
          fs.writeFileSync(API_PATH, apiTemplate)
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
