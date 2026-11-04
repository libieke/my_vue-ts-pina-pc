import request from "@/utils/request";
import avatarImg from "@/assets/pictrue/avatar.png";

const API = `/mes-api`;


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

interface ItypeAPI<T> {
  data: T | null;
  msg: string | null;
  code: number;
}

type Res<T> = Promise<ItypeAPI<T>>;


const MOCK_USERS: any = {
  admin: {
    password: "111111",
    user: {
      username: "admin",
      avatar: avatarImg,
      email: "admin@example.com",
      role: "管理员",
    },
    token: "mock_token_admin_" + Date.now(),
  },
  user: {
    password: "123456",
    user: {
      username: "user",
      avatar: avatarImg,
      email: "user@example.com",
      role: "普通用户",
    },
    token: "mock_token_user_" + Date.now(),
  },
};

const mockDelay = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

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


export const reqLogin = async (params: ReqLogin) => {
  return mockLogin(params);

};

export const reqUserInfo = async () => {
  return mockUserInfo();

};


export const listMaintainHisCountByDept = (): Res<null> => {
  return request({
    url: `${API}/api-eq/backend-anon/device/maintain/listMaintainHisCountByDept`,
    method: "get",
  });
};

export const FlashSessionListApi = (): Res<null> => {
  return request({
    url: `${API}/flash-session-list`,
    method: "get",
  });
};
