import request from '@/utils/request'

// 查询菜单列表
export function listMenu(query) {
  return request({
    url: '/system/menu/list',
    method: 'get',
    params: query
  })
}


export function listMenuTree(query) {
  return request({
    url: '/system/menu/get_menu_tree',
    method: 'get',
    params: query
  })
}

export function listAuthMenu(query) {
  return request({
    url: '/system/menu/get_auth_list',
    method: 'get',
    params: query
  })
}

// 查询菜单详细
export function getMenu(query) {
  return request({
    url: '/system/menu/get_by_id',
    method: 'get',
    params: query
  })
}

// 查询菜单下拉树结构
export function treeselect() {
  return request({
    url: '/system/menu/get_all_enabled_menu_tree',
    method: 'get'
  })
}

// 根据角色ID查询菜单下拉树结构
// export function roleMenuTreeselect(roleId) {
//   return request({
//     url: '/system/menu/roleMenuTreeselect/' + roleId,
//     method: 'get'
//   })
// }

// 新增菜单
export function addMenu(data) {
  return request({
    url: '/system/menu/add',
    method: 'post',
    data: data
  })
}

// 修改菜单
export function updateMenu(data) {
  return request({
    url: '/system/menu/edit',
    method: 'put',
    data: data
  })
}

// 删除菜单
export function delMenu(data) {
  return request({
    url: '/system/menu/delete',
    method: 'delete',
    data
  })
}

export function updateLogAndCacheMethod(data) {
  return request({
    url: '/system/menu/update_log_cache_method',
    method: 'put',
    data
  })
}