/**
 * A start for the base class of all visualitations
 */
export default class Visualization {
    oninit(vnode) {
        this.main = vnode.attrs.main;
    }

    draw() {}
    update() {}
}