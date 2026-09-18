import request from "@/utils/request";
const API = `/mes-api`;

// ==================== 类型定义 ====================

interface ReqLogin {
  userName?: string;
  passWord?: string;
  name?: string;
  paw?: string;
}

interface ReqStatus {
  id: string;
  navStatus: string;
}

/**
 * 通用 API 响应数据类型
 * T 为实际数据的泛型
 */
interface ItypeAPI<T> {
  data: T | null; // 请求的数据，用泛型
  msg: string | null; // 返回状态码的信息
  code: number; // 返回后端自定义的的状态码（200=成功）
}

type Res<T> = Promise<ItypeAPI<T>>;

// ==================== Mock 数据 ====================

/**
 * Mock 用户数据
 * 模拟不同的用户信息
 */
const MOCK_USERS: any = {
  admin: {
    password: "111111",
    user: {
      username: "admin",
      avatar: "/src/assets/pictrue/avatar.png",
      email: "admin@example.com",
      role: "管理员",
    },
    token: "mock_token_admin_" + Date.now(),
  },
  user: {
    password: "123456",
    user: {
      username: "user",
      avatar: "/src/assets/pictrue/avatar.png",
      email: "user@example.com",
      role: "普通用户",
    },
    token: "mock_token_user_" + Date.now(),
  },
};

/**
 * 模拟网络延迟
 * @param ms 延迟毫秒数
 */
const mockDelay = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * 本地 Mock 登录
 * 支持的用户：
 * - 账号: admin, 密码: 111111
 * - 账号: user,  密码: 123456
 */
const mockLogin = async (credentials: ReqLogin): Promise<ItypeAPI<any>> => {
  await mockDelay(500);

  const username = credentials.userName || credentials.name;
  const password = credentials.passWord || credentials.paw;

  if (!username || !password) {
    return {
      code: 400,
      msg: "用户名和密码不能为空",
      data: null,
    };
  }

  const userInfo = MOCK_USERS[username];
  if (!userInfo) {
    return {
      code: 401,
      msg: "用户不存在，请使用 admin/user 账户登录",
      data: null,
    };
  }

  if (userInfo.password !== password) {
    return {
      code: 401,
      msg: "密码错误",
      data: null,
    };
  }

  return {
    code: 200,
    msg: "登录成功",
    data: {
      token: userInfo.token,
      username: userInfo.user.username,
    },
  };
};

/**
 * 本地 Mock 获取用户信息
 */
const mockUserInfo = async (): Promise<ItypeAPI<any>> => {
  await mockDelay(300);

  return {
    code: 200,
    msg: "获取用户信息成功",
    data: {
      checkUser: MOCK_USERS.admin.user,
    },
  };
};

// ==================== API 接口 ====================

/**
 * 用户登录
 * @param params 登录参数 { userName, passWord }
 *
 * 示例：
 * reqLogin({ userName: 'admin', passWord: '111111' })
 */
export const reqLogin = async (params: ReqLogin) => {
  // 本地测试：使用 mock 数据
  // 如果要使用真实后端接口，注释掉 mockLogin 这一行，启用下面的 request 调用
  return mockLogin(params);

  // 真实接口（需要后端 API）：
  // return request({
  //   url: '/test',
  //   method: 'post',
  //   params
  // })
};

/**
 * 获取用户信息
 *
 * 返回数据格式：
 * {
 *   code: 200,
 *   msg: '获取用户信息成功',
 *   data: {
 *     checkUser: {
 *       username: 'admin',
 *       avatar: '...',
 *       email: '...',
 *       role: '...'
 *     }
 *   }
 * }
 */
export const reqUserInfo = async () => {
  // 本地测试：使用 mock 数据
  return mockUserInfo();

  // 真实接口（需要后端 API）：
  // return request({
  //   url: '/test',
  //   method: 'post',
  // })
};

// ==================== 其他 API ====================

/**
 * 获取维保历史统计（示例接口）
 */
export const listMaintainHisCountByDept = (): Res<null> => {
  return request({
    url: `${API}/api-eq/backend-anon/device/maintain/listMaintainHisCountByDept`,
    method: "get",
  });
};

/**
 * Flash 会话列表（示例接口）
 */
export const FlashSessionListApi = (): Res<null> => {
  return request({
    url: `${API}/flash-session-list`,
    method: "get",
  });
};
