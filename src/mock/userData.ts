export interface UserRecord {
  nickName: string
  username: string
  type: number
  orgName: string
  email?: string
  status?: string
  department?: string
  createTime?: string
}

export interface MockApiResponse<T> {
  code: number
  msg: string
  data: T[]
}

export const USER_LIST_MOCK: UserRecord[] = [
  {
    nickName: '张三',
    username: 'zhangsan',
    type: 0,
    orgName: '华为',
    email: 'zhangsan@huawei.com',
    status: '在线',
    department: '研发中心',
    createTime: '2024-01-10',
  },
  {
    nickName: '李四',
    username: 'lisi',
    type: 1,
    orgName: '腾讯',
    email: 'lisi@tencent.com',
    status: '离线',
    department: '运营部',
    createTime: '2024-02-12',
  },
  {
    nickName: '王五',
    username: 'wangwu',
    type: 1,
    orgName: '阿里',
    email: 'wangwu@alibaba.com',
    status: '在线',
    department: '市场部',
    createTime: '2024-03-08',
  },
  {
    nickName: '赵六',
    username: 'zhaoliu',
    type: 0,
    orgName: '京东',
    email: 'zhaoliu@jd.com',
    status: '忙碌',
    department: '采购部',
    createTime: '2024-04-11',
  },
  {
    nickName: '钱七',
    username: 'qianqi',
    type: 1,
    orgName: '字节跳动',
    email: 'qianqi@bytedance.com',
    status: '在线',
    department: '产品部',
    createTime: '2024-05-02',
  },
  {
    nickName: '孙八',
    username: 'sunba',
    type: 1,
    orgName: '美团',
    email: 'sunba@meituan.com',
    status: '离线',
    department: '客服部',
    createTime: '2024-06-19',
  },
  {
    nickName: '周九',
    username: 'zhoujiu',
    type: 0,
    orgName: '小米',
    email: 'zhoujiu@xiaomi.com',
    status: '在线',
    department: '数据中心',
    createTime: '2024-07-01',
  },
  {
    nickName: '吴十',
    username: 'wushi',
    type: 1,
    orgName: '滴滴',
    email: 'wushi@didiglobal.com',
    status: '忙碌',
    department: '人事部',
    createTime: '2024-08-17',
  },
]

export const USER_SET_MOCK: UserRecord[] = [
  {
    nickName: '陈一',
    username: 'chenyi',
    type: 0,
    orgName: '金融科技中心',
    email: 'chenyi@fintech.com',
    status: '在线',
    department: '风控部',
    createTime: '2024-01-05',
  },
  {
    nickName: '林二',
    username: 'line',
    type: 1,
    orgName: '供应链云',
    email: 'line@chaincloud.com',
    status: '离线',
    department: '物流部',
    createTime: '2024-01-20',
  },
  {
    nickName: '何三',
    username: 'hesan',
    type: 1,
    orgName: '智慧城市',
    email: 'hesan@smartcity.com',
    status: '在线',
    department: '政务部',
    createTime: '2024-02-09',
  },
  {
    nickName: '鲁四',
    username: 'lusi',
    type: 0,
    orgName: '云计算实验室',
    email: 'lusi@cloudlab.com',
    status: '忙碌',
    department: '运维部',
    createTime: '2024-02-22',
  },
  {
    nickName: '郑五',
    username: 'zhengwu',
    type: 1,
    orgName: '数字营销',
    email: 'zhengwu@digitalmarketing.com',
    status: '在线',
    department: '内容部',
    createTime: '2024-03-17',
  },
  {
    nickName: '冯六',
    username: 'fengliu',
    type: 1,
    orgName: '健康医疗',
    email: 'fengliu@healthcare.com',
    status: '离线',
    department: '门诊部',
    createTime: '2024-04-03',
  },
  {
    nickName: '许七',
    username: 'xuqi',
    type: 0,
    orgName: '企业服务',
    email: 'xuqi@enterprise.com',
    status: '在线',
    department: '客户成功部',
    createTime: '2024-05-23',
  },
  {
    nickName: '陶八',
    username: 'taoba',
    type: 1,
    orgName: 'AI平台',
    email: 'taoba@aiplatform.com',
    status: '忙碌',
    department: '算法部',
    createTime: '2024-06-14',
  },
]

export const mockUserListApi = async (): Promise<MockApiResponse<UserRecord>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: '获取用户列表成功',
        data: USER_LIST_MOCK,
      })
    }, 300)
  })
}

export const mockUserSettingApi = async (): Promise<MockApiResponse<UserRecord>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: '获取用户设置列表成功',
        data: USER_SET_MOCK,
      })
    }, 350)
  })
}

// 后续接真实接口时，直接替换下面这两个函数即可：
// export const fetchUserList = async () => request({ url: '/user/list', method: 'get' })
// export const fetchUserSettingList = async () => request({ url: '/user/settings', method: 'get' })
