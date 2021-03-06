import m from "mithril";
import MenuBarComponent from "@/ui/components/MenuBarComponent";
import nodeLinkImage from "../../../resources/images/node-link-diagram.png";
import hierarchicalEdgeImage from "../../../resources/images/hierarchical-edge-bundling.png";
import massiveSequenceImage from "../../../resources/images/massive-sequence-view.png";
import profileImage from "../../../resources/images/download.png";
import profileImageJort from "../../../resources/images/jort.png";
import profileImageAleksandar from "../../../resources/images/aleksandar.jpg";
import profileImageCollin from "../../../resources/images/collin.jpg";
import profileImageLaura from "../../../resources/images/laura.jpg";
import profileImageBas from "../../../resources/images/bas.jpg";
import profileImageStef from "../../../resources/images/stef.jpg";

export default class IndexView {
    scrollToElement(id) {
        const element = document.getElementById(id);
        element.scrollIntoView(true);
        window.scrollTo({top: element.getBoundingClientRect().top + window.pageYOffset - 150});
    }

    view(vnode) {
        if(vnode.attrs.scroll !== undefined) {
            setTimeout(() => this.scrollToElement(vnode.attrs.scroll), 10);
        }
        
        return (
            <div class="view">
                <MenuBarComponent></MenuBarComponent>
                <div class="index-container">
                    <div class="mini-titles">
                        <h1> About the project </h1>
                    </div>

                    <div class="intro-text"> 
                        <p>Though the large data collection present in social networks, financial networks, etc., the need for modelling tools enabling the exploration and detailed analysis of the collected data has become apparent. In particular, tools facilitating user interaction with the data in form of dynamic graphs have been in increasing demand. As a result, there have been works making tools facilitating the visualization of dynamic data. The importance of such tools is underlined by the increasing presence of large data sets. By lack of visualization means, the user is unable to adequately navigate the data contributing to unnecessary financial and time investments. Moreover, these interaction methods allowing for an in-depth understanding of the network evolution processes give unchallenged insights into the complex behaviour of the system. Combining this with the ability to interact, to enable user creativity, it becomes abundantly clear that these tools are vital to improved analysis of dynamic graph data. In the options container you can find different options in order to help visualize data better, having the choice of which visualization the user would like to change. In the statistics container you can find the legenda for the colors used in the visualizations and which colors corresponds to each job title. Furthermore, the statistics show what features the input data has, giving the user a more clear perspective on the analysis of it.</p>
                    </div>

                    <div class="mini-titles">
                        <h1>The visualizations</h1>
                    </div>

                    <div class="vis-item" id="node-link">
                        <div class="vis-title">The Node-link Diagram</div>
                        <div class="vis-content">
                            <img src={nodeLinkImage} class="img" /> 
                            <div class="intro-text">The node link diagram aims to show different connections between nodes, one of the goals being that groups of people that communicate frequently are easily distinguishable. Bearing in mind that the node-link diagram is implemented with the Enron data-set, an undirected graph is used, where the vertices represent every employee in the dataset, and the edges represent the e-mails sent between the employees. This tool has been built upon by changing several properties of the nodes and edges. For example, the color of the vertices is based on the function in the company of that employee, to visualize which employees communicate regularly. The opacity of an edge is based on the number of e-mails sent between employees. This means opacity will increase when the communication between employees is more frequent. In addition, the layout of the diagram is calculated based on a real time physics simulation. Nodes get increasingly attracted to each other the more edges they share. Another option for the visualization of this graph is to aggregate the nodes based on their job title. This is done by holding the shift key and clicking on a node. This node will then be aggregated with all other nodes with the same color/jobtitle. When you click again with shift on the newly created large node, all nodes with that jobtitle are drawn seperately again. With this function you can easily see which employees specifically interact with each other inside or outside their job title. You can also normal click on a node to select the node. When you click and hold on a node, all the edges connected to that node get highlighed. This also happens in the other visualizations. You can also use the selection tool with control click and drag to select a group of nodes at a time. Using a node-link diagram, one can easily depict clusters of employees that communicate frequently. Since the visualization dynamically changes its layout based on the input data, the user can view how the communication changes. When the user opts to group the visualization based on job titles, one can clearly see different connections between the groups of employees with different job titles.</div>
                        </div>
                    </div>
                   
                    <div class="vis-item" id="hierarchical-edge">
                        <div class="vis-title right">The Hierarchical Edge Bundling</div>
                        <div class="vis-content">
                            <div class="intro-text">A hierarchical edge bundling diagram is an undirected graph that consists of a set of nodes and a set of edges, each edge serving as a link between different nodes. In this paper a particular variant of this visualization method that positions the nodes around an arc is used. The nodes, which are the ???leaves??? of the data, or the ???children??? in the ???child-parent???-relation, are clustered by their parent-dependency. An edge is the line between a pair of nodes that represents a certain relationship or interaction that may arise between said nodes, in our case, the emails sent in the company. The nodes are clustered in a circle by their parent-relation in this case their job title. The edges are bundled in a manner that resembles a cable-like arrangement. This allows for a clear display of the connections, by reducing visual clutter, and also shows the relationships between different groups within the data set. Clicking a node selects it, along with its edges. The edges are colored depending on the direction of the connection ??? outgoing edges are red, incoming ??? green, and in case of a two-sided connection we have an orange-ish coloring. The nodes are colored in a similar manner. This ensures that the relation between different nodes is easily visible. Furthermore, each of the edges has an opacity property that corresponds to the sentiment of the email sent.</div>
                            <img src={hierarchicalEdgeImage} class="img" /> 
                        </div>
                    </div>
                    
                    <div class="vis-item" id="massive-sequence">
                        <div class="vis-title">The Massive Sequence View</div>
                        <div class="vis-content double">
                            <div class="intro-text">The massive sequence view diagram displays the nodes colored by their job title on the left along the y-axis and the selected timeframe along the x-axis. The blue lines displayed in the middle represent the emails sent between two distinct people ??? the start of the line being the first and the end being the second person. Hovering over any part of the visualization will highlight the relevant date. The diagram provides an easy and intuitive method of analyzing temporal and structural changes, and trends within the dataset.</div>
                            <img src={massiveSequenceImage} class="img" /> 
                        </div>
                    </div>

                    <div class="mini-titles">
                        <h1> The team </h1>
                    </div>
                    
                    <div class="container">
                        <div class="our-team"> 
                            <div class="pic">
                                <img src={profileImageAleksandar} alt="" />
                            </div>
                            <div class="team-content">
                                <h3 class="title"> Aleksandar </h3>
                                <span class="post"> Hierarchical Bundling</span>
                                <div class="email"> a.grigorov@student.tue.nl </div>
                            </div>
                        </div>
                    </div>

                    <div class="container">
                        <div class="our-team"> 
                            <div class="pic">
                                <img src={profileImageBas} alt="" />
                            </div>
                            <div class="team-content">
                                <h3 class="title"> Bas </h3>
                                <span class="post"> Node-link diagram</span>
                                <div class="email"> b.meuwissen@student.tue.nl </div>
                            </div>
                        </div>
                    </div>

                    <div class="container">
                        <div class="our-team"> 
                            <div class="pic">
                                <img src={profileImageJort} alt="" />
                            </div>
                            <div class="team-content">
                                <h3 class="title"> Jort </h3>
                                <span class="post"> Options/Statistics</span>
                                <div class="email"> j.r.v.driel@student.tue.nl </div>
                            </div>
                        </div>
                    </div>

                    <div class="container">
                        <div class="our-team"> 
                            <div class="pic">
                                <img src={profileImageStef} alt="" />
                            </div>
                            <div class="team-content">
                                <h3 class="title"> Stef </h3>
                                <span class="post"> Node-Link diagram </span>
                                <div class="email"> s.m.a.halmans@student.tue.nl </div>
                            </div>
                        </div>
                    </div>

                    <div class="container">
                        <div class="our-team"> 
                            <div class="pic">
                                <img src={profileImageCollin} alt="" />
                            </div>
                            <div class="team-content">
                                <h3 class="title"> Collin </h3>
                                <span class="post"> Massive Sequence View  </span>
                                <div class="email"> c.t.harcarik@student.tue.nl </div>
                            </div>
                        </div>
                    </div>

                    <div class="container">
                        <div class="our-team"> 
                            <div class="pic">
                                <img src={profileImageLaura} alt="" />
                            </div>
                            <div class="team-content">
                                <h3 class="title"> Laura </h3>
                                <span class="post"> UI design </span>
                                <div class="email"> l.nica@student.tue.nl </div>
                            </div>
                        </div>
                    </div>

                    <div class="mini-titles">
                        <h1> The video </h1>
                    </div>

                    <iframe width="100%" height="500px" src="https://www.youtube.com/embed/1ODnUvJUl98" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            </div>
        );
    }
}