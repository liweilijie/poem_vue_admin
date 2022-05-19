<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="药箱名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入药品名称"
          clearable
          @keyup.enter="getList"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="getList"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8" style="height: 35px">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['his/category/add']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['his/category/edit']"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['his/category/delete']"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['his/category/export']"
          >导出</el-button
        >
      </el-col>
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="postList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="药箱编号"
        align="center"
        width="100"
        show-overflow-tooltip
        prop="id"
      />
      <el-table-column label="药箱名称" align="center" prop="name" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="created_at"
        width="180"
      >
        <template #default="scope">
          <span>{{ parseTime(scope.row.created_at) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        v-hasPermi="['his/category/delete', 'his/category/edit']"
      >
        <template #default="scope">
          <el-button
            type="text"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['his/category/edit']"
            >修改</el-button
          >
          <el-button
            type="text"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['his/category/delete']"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.page_num"
      v-model:limit="queryParams.page_size"
      @pagination="getList"
    />

    <!-- 添加或修改药品对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="postRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="药箱名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入药箱名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Post">
import { getCurrentInstance,ref,toRefs,reactive } from 'vue';
import {
  listCategory,
  addCategory,
  delCategory,
  getCategory,
  updateCategory,
} from '@/api/his/category';

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict('sys_normal_disable');

const postList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const cate_ids = ref([]);
const medicinal_names = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');

const data = reactive({
  form: {},
  queryParams: {
    page_num: 1,
    page_size: 10,
    post_code: undefined,
    post_name: undefined,
    status: undefined,
  },
  rules: {
    name: [
      { required: true, message: '药箱名称不能为空', trigger: 'blur' },
    ],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询药品列表 */
async function getList() {
  loading.value = true;
  const response = await listCategory(queryParams.value);
  postList.value = response.list;
  total.value = response.total;
  loading.value = false;
}
/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}
/** 表单重置 */
function reset() {
  form.value = {
    id: undefined,
    name: undefined,
  };
  proxy.resetForm('postRef');
}

/** 重置按钮操作 */
const resetQuery = async () => {
  proxy.resetForm('queryRef');
  queryParams.value.page_num = 1;
  await getList();
};
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  cate_ids.value = selection.map((item) => item.id);
  medicinal_names.value = selection.map((item) => item.name);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = '添加药箱名称';
}
/** 修改按钮操作 */
async function handleUpdate(row) {
  console.log("row:");
  console.log(row);
  reset();
  const id = row.id;
  const response = await getCategory({ id });
  form.value = response;
  open.value = true;
  title.value = '修改药箱';
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs['postRef'].validate((valid) => {
    if (valid) {
      if (form.value.id != undefined) {
        updateCategory(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addCategory(form.value).then((response) => {
          proxy.$modal.msgSuccess('新增成功');
          open.value = false;
          getList();
        });
      }
    }
  });
}
/** 删除按钮操作 */
function handleDelete(row) {
  const ids = row.id ? [row.id] : cate_ids.value;
  const postNames = row.id ? row.name: medicinal_names.value;
  proxy.$modal
    .confirm('是否确认删除药箱编号为"' + postNames + '"的数据项？')
    .then(function () {
      return delCategory({ ids });
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess('删除成功');
    })
    .catch(() => {});
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'his/category/export',
    {
      ...queryParams.value,
    },
    `post_${new Date().getTime()}.xlsx`
  );
}

getList();
</script>
