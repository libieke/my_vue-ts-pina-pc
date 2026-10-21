import { GET_TOKEN, GET_USER_INFO, GET_USER_ROLE, REMOVE_TOKEN, REMOVE_USER_INFO, REMOVE_USER_ROLE, SET_TOKEN, SET_USER_INFO, SET_USER_ROLE } from "../token";
describe("token 工具", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it("token 支持读写与删除", () => {
    expect(GET_TOKEN()).toBeNull();
    SET_TOKEN("test-token");
    expect(GET_TOKEN()).toBe("test-token");
    REMOVE_TOKEN();
    expect(GET_TOKEN()).toBeNull();
  });
  it("用户信息支持读写与删除", () => {
    SET_USER_INFO({
      username: "admin",
      avatar: "/avatar.png"
    });
    expect(GET_USER_INFO()).toEqual({
      username: "admin",
      avatar: "/avatar.png"
    });
    REMOVE_USER_INFO();
    expect(GET_USER_INFO()).toEqual({
      username: "",
      avatar: ""
    });
  });
  it("用户信息损坏时回退为空信息", () => {
    localStorage.setItem("USER_INFO", "{invalid json");
    expect(GET_USER_INFO()).toEqual({
      username: "",
      avatar: ""
    });
  });
  it("角色默认 user，并支持读写与删除", () => {
    expect(GET_USER_ROLE()).toBe("user");
    SET_USER_ROLE("admin");
    expect(GET_USER_ROLE()).toBe("admin");
    REMOVE_USER_ROLE();
    expect(GET_USER_ROLE()).toBe("user");
  });
});