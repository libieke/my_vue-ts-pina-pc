import { mount } from "@vue/test-utils";
import ContentTitle from "../ContentTitle/index.vue";
describe("ContentTitle 组件", () => {
  it("渲染默认插槽内容", () => {
    const wrapper = mount(ContentTitle, {
      slots: {
        default: '<p class="slot-content">页面内容</p>'
      }
    });
    expect(wrapper.find(".bg-white").exists()).toBe(true);
    expect(wrapper.find(".slot-content").text()).toBe("页面内容");
  });
  it("title 默认为空字符串", () => {
    const wrapper = mount(ContentTitle);
    expect(wrapper.props("title")).toBe("");
  });
  it("支持传入 title", () => {
    const wrapper = mount(ContentTitle, {
      props: {
        title: "测试标题"
      }
    });
    expect(wrapper.props("title")).toBe("测试标题");
  });
});