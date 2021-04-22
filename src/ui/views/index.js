import m from "mithril";
import TestComponent from "@/ui/components/test";

export default class IndexView {
    view() {
        return (
            <div>
                <TestComponent></TestComponent>
                Hello World!
            </div>
        );
    }
}