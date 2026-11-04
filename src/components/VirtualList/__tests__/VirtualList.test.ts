
import { h } from "vue";
import { mount } from "@vue/test-utils";

import VirtualList from "../index.vue";

const items = [
  { id: 1, name: "张三", age: 18, city: "北京" },
  { id: 2, name: "李四", age: 20, city: "上海" },
];

const columns = [
  { key: "name", label: "姓名", flex: 1 },
  { key: "age", label: "年龄", width: 80, align: "right" },
];

function mountList(props = {}, slots = {}) {
  return mount(VirtualList, {
    props: { items, itemSize: 40, ...props },
    slots,
  });
}

describe("VirtualList", () => {
  it("根据 columns 渲染表头", () => {
    const wrapper = mountList({ columns });
    const headers = wrapper.findAll(".virtual-list__cell--header");

    expect(headers.map((header) => header.text())).toEqual(["姓名", "年龄"]);
  });

  it("列宽与对齐来自 columns 配置，表头与行共用", () => {
    const wrapper = mountList({ columns });
    const ageHeader = wrapper.findAll(".virtual-list__cell--header")[1];

    expect(ageHeader.attributes("style")).toContain("width: 80px");
    expect(ageHeader.attributes("style")).toContain("flex-end");
  });

  it("没有 cell 插槽时默认展示字段值", () => {
    const wrapper = mountList({ columns });

    expect(wrapper.text()).toContain("张三");
    expect(wrapper.text()).toContain("18");
  });

  it("cell-<key> 插槽可以自定义单元格", () => {
    const wrapper = mountList(
      { columns },
      {
        "cell-age": ({ item }: { item: { age: number } }) =>
          h("b", { class: "custom-age" }, `年龄 ${item.age}`),
      },
    );

    const custom = wrapper.find(".custom-age");

    expect(custom.exists()).toBe(true);
    expect(custom.text()).toBe("年龄 18");
  });

  it("不传 columns 时保持整行插槽的旧用法，且不渲染表头", () => {
    const wrapper = mount(VirtualList, {
      props: { items, itemSize: 40 },
      slots: {
        default: ({ item }: { item: { name: string } }) =>
          h("div", { class: "row" }, item.name),
      },
    });

    expect(wrapper.find(".virtual-list__header").exists()).toBe(false);
    expect(wrapper.find(".row").text()).toBe("张三");
  });

  it("debug 开启时会在控制台打印渲染的数据", () => {
    const log = jest.spyOn(console, "log").mockImplementation(() => {});

    mountList({ columns, debug: true });

    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("[VirtualList]"),
      expect.any(Array),
    );

    log.mockRestore();
  });

  it("debug 关闭时不会打印日志", () => {
    const log = jest.spyOn(console, "log").mockImplementation(() => {});

    mountList({ columns });

    expect(log).not.toHaveBeenCalled();

    log.mockRestore();
  });
});
