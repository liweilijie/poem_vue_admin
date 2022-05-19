<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="药品名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入药品名称"
          clearable
          @keyup.enter="getList"
        />
      </el-form-item>
      <el-form-item label="药品类目" prop="category_id">
        <el-input
          v-model="queryParams.category_id"
          placeholder="请输入药品类目名称"
          clearable
          @keyup.enter="getList"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="药品状态"
          clearable
        >
          <el-option
            v-for="dict in sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
          v-hasPermi="['his/medicinal/add']"
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
          v-hasPermi="['his/medicinal/edit']"
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
          v-hasPermi="['his/medicinal/delete']"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system/post/export']"
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
        label="药品编号"
        align="center"
        width="100"
        show-overflow-tooltip
        prop="post_id"
      />
      <el-table-column label="药品名称" align="center" prop="name" />
      <el-table-column label="药品编码" align="center" prop="batch_number" />
      <el-table-column label="药品规格" align="center" prop="spec" />
      <el-table-column label="有效期" align="center" prop="validity" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
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
        v-hasPermi="['his/medicinal/delete', 'his/medicinal/edit']"
      >
        <template #default="scope">
          <el-button
            type="text"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['his/medicinal/edit']"
            >修改</el-button
          >
          <el-button
            type="text"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['his/medicinal/delete']"
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
        <el-form-item label="药品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入药品名称" />
        </el-form-item>
        <el-form-item label="药品编码" prop="batch_number">
          <el-input v-model="form.batch_number" placeholder="请输入编码名称" />
        </el-form-item>
        <el-form-item label="药品规格" prop="spec">
          <el-input v-model="form.spec" placeholder="请输入药品规格" />
        </el-form-item>
        <el-form-item label="有效期" prop="validity">
          <el-input v-model="form.validity" placeholder="请输入药品有效期" />
        </el-form-item>
        <el-form-item label="药品状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in sys_normal_disable"
              :key="dict.value"
              :label="dict.value"
              >{{ dict.label }}</el-radio
            >
          </el-radio-group>
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
  listMedicinal,
  addMedicinal,
  delMedicinal,
  getMedicinal,
  updateMedicinal,
} from '@/api/his/medicinal';

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict('sys_normal_disable');

const postList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
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
      { required: true, message: '药品名称不能为空', trigger: 'blur' },
    ],
    validity: [
      { required: true, message: '药品有效期不能为空', trigger: 'blur' },
    ],
    post_sort: [
      { required: true, message: '药品顺序不能为空', trigger: 'blur' },
    ],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询药品列表 */
async function getList() {
  loading.value = true;
  const response = await listMedicinal(queryParams.value);
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
    batch_number: undefined,
    spec: undefined,
    count: undefined,
    validity: undefined,
    status: '1',
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
  ids.value = selection.map((item) => item.id);
  medicinal_names.value = selection.map((item) => item.name);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = '添加药品';
}
/** 修改按钮操作 */
async function handleUpdate(row) {
  reset();
  const post_id = row.id || ids.value[0];
  const response = await getMedicinal({ post_id });
  form.value = response;
  open.value = true;
  title.value = '修改药品';
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs['postRef'].validate((valid) => {
    if (valid) {
      if (form.value.post_id != undefined) {
        updatePost(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addPost(form.value).then((response) => {
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
  const post_ids = row.id ? [row.id] : ids.value;
  const postNames = row.id ? row.name: medicinal_names.value;
  proxy.$modal
    .confirm('是否确认删除药品编号为"' + postNames + '"的数据项？')
    .then(function () {
      return delPost({ post_ids });
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
    'his/medicinal/export',
    {
      ...queryParams.value,
    },
    `post_${new Date().getTime()}.xlsx`
  );
}

getList();
</script>
