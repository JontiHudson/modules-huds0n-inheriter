"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInheritableComponent = void 0;
const createComponent_1 = require("./createComponent");
function createInheritableComponent(Component) {
    return (0, createComponent_1.createComponent)(Component, {});
}
exports.createInheritableComponent = createInheritableComponent;
