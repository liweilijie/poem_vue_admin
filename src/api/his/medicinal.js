import request from '@/utils/request'

// 查询药品列表
export function listMedicinal(query) {
  return request({
    url: '/his/medicinal/list',
    method: 'get',
    params: query
  })
}

// 查询药品详细
export function getMedicinal(query) {
  return request({
    url: '/his/medicinal/get_by_id',
    method: 'get',
    params: query
  })
}

// 新增药品
export function addMedicinal(data) {
  return request({
    url: '/his/medicinal/add',
    method: 'post',
    data: data
  })
}

// 修改药品
export function updateMedicinal(data) {
  return request({
    url: '/his/medicinal/edit',
    method: 'put',
    data: data
  })
}

// 删除药品
export function delMedicinal(data) {
  return request({
    url: '/his/medicinal/delete',
    method: 'delete',
    data
  })
}
