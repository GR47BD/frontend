import m from "mithril";
import TestComponent from "@/ui/components/test";

export default class IndexView {
    view() {
        return (
            <div> 
                {/* In the next line the component TestComponent is loaded in as HTML element */}
                <TestComponent></TestComponent>
                {/* The following line contains standard text. */} 
                Hello World! test3
            </div>
        );
        // HTML syntax that is returned may only contain one root element
        // So the following wouldn't be allowed:
        // return (<div></div> <div></div>)
    }
}