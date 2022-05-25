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
      <el-form-item label="药箱" prop="category_id">
        <el-select v-model="queryParams.category_id" placeholder="请选择药箱">
          <el-option
              v-for="item in cateOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
          ></el-option>
        </el-select>
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
          type="info"
          plain
          icon="Upload"
          @click="handleImport"
          v-hasPermi="['his/medicinal/import']"
          >导入</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['his/medicinal/export']"
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
        label="药箱"
        align="center"
        width="100"
        show-overflow-tooltip
        prop="category_name"
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
        <el-form-item label="药箱" prop="category_id">
          <el-select v-model="form.category_id" placeholder="请选择药箱">
            <el-option
                v-for="item in cateOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
            ></el-option>
          </el-select>
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

    <!-- 用户导入对话框 -->
    <el-dialog
      :title="upload.title"
      v-model="upload.open"
      width="400px"
      append-to-body
    >
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <div class="el-upload__tip">
              <el-checkbox
                v-model="upload.updateSupport"
              />是否更新已经存在的用户数据
            </div>
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link
              type="primary"
              :underline="false"
              style="font-size: 12px; vertical-align: baseline"
              @click="importTemplate"
              >下载模板</el-link
            >
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Post">
import { onMounted, getCurrentInstance,ref,toRefs,reactive } from 'vue';
import {
  listMedicinal,
  addMedicinal,
  delMedicinal,
  getMedicinal,
  updateMedicinal,
} from '@/api/his/medicinal';
import { listCategory } from "@/api/his/category";
import { getToken } from '@/utils/auth'

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict('sys_normal_disable');

const postList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const med_ids = ref([]);
const medicinal_names = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');
const cateOptions = ref([]);

/*** 用户导入参数 */
const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: 'Bearer ' + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + '/his/medicinal/import',
});

const data = reactive({
  form: {},
  queryParams: {
    page_num: 1,
    page_size: 3,
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

onMounted(() => {
  get_options();
})

// 获取选项
async function get_options() {
  let queryParams = {
    page_num: 1,
    page_size: Number.MAX_SAFE_INTEGER,
  };
  const [{ list: cates}] = await Promise.all(
      [listCategory(queryParams)]
  );
  // const cates = await listCategory(queryParams.value);
  cateOptions.value = cates;
  console.log('cates:', cates);
  console.log('options:', cateOptions);
}

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
  med_ids.value = selection.map((item) => item.id);
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
  const id = row.id || med_ids.value[0];
  const response = await getMedicinal({ id });
  form.value = response;
  open.value = true;
  title.value = '修改药品';
  get_options();
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs['postRef'].validate((valid) => {
    if (valid) {
      if (form.value.id != undefined) {
        updateMedicinal(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功');
          open.value = false;
          getList();
        });
      } else {
        addMedicinal(form.value).then((response) => {
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
  const ids = row.id ? [row.id] : med_ids.value;
  const postNames = row.id ? row.name: medicinal_names.value;
  proxy.$modal
    .confirm('是否确认删除药品编号为"' + postNames + '"的数据项？')
    .then(function () {
      return delMedicinal({ ids });
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

/** 导入按钮操作 */
function handleImport() {
  upload.title = '用户导入';
  upload.open = true;
}

/** 下载模板操作 */
function importTemplate() {
  proxy.download(
    'system/user/importTemplate',
    {},
    `user_template_${new Date().getTime()}.xlsx`
  );
}
/**文件上传中处理 */
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true;
};
/** 文件上传成功处理 */
const handleFileSuccess = (response, file, fileList) => {
  upload.open = false;
  upload.isUploading = false;
  proxy.$refs['uploadRef'].clearFiles();
  proxy.$alert(
    "<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" +
      response.msg +
      '</div>',
    '导入结果',
    { dangerouslyUseHTMLString: true }
  );
  getList();
};
/** 提交上传文件 */
function submitFileForm() {
  proxy.$refs['uploadRef'].submit();
}

getList();
</script>
