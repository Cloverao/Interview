module.exports = {
  // 表单配置
  formConfig: {
    // 查询条件
    formItems: [{ label: '网点', prop: 'site', itemType: 'hyAllSite' }],
    // 表单数据
    formData: { site: '' },
    // 是否默认展开查询
    showExpand: true
  },
  // 表格配置
  tableConfig: {
    // 列配置
    columns: [{ label: '网点', prop: 'siteName' }],
    // 是否展示操作列
    showOperation: true,
    // 操作列位置
    operationPosition: 'right',
    // 操作列宽度 default:auto
    operationWidth: 'auto',
    // 是否固定列
    showFixed: false,
    // 是否展示index序列
    showIndex: true,
    // 是否多选
    showCheckbox: false,
    // 是否展示分页
    noPager: false
  },
  // 是否展示导出
  isExport: true
}
