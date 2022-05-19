import request from '@/utils/request'

// 查询药品列表
export function listCategory(query) {
  return request({
    url: '/his/category/list',
    method: 'get',
    params: query
  })
}

// 查询药品详细
export function getCategory(query) {
  return request({
    url: '/his/category/get_by_id',
    method: 'get',
    params: query
  })
}

// 新增药品
export function addCategory(data) {
  return request({
    url: '/his/category/add',
    method: 'post',
    data: data
  })
}

// 修改药品
export function updateCategory(data) {
  return request({
    url: '/his/category/edit',
    method: 'put',
    data: data
  })
}

// 删除药品
export function delCategory(data) {
  return request({
    url: '/his/category/delete',
    method: 'delete',
    data
  })
}
