/**
 * A start for the base class of all visualitations
 */
export default class Visualization {
    oninit(vnode) {
        this.main = vnode.attrs.main;
    }

    /**
     * Called the first time the visualization has to be drawn.
     */
    draw() {}

    /**
     * Called when the data has changed and the visualization has to be redrawn.
     */
    update() {
        this.main.dataHandler.dataChanged = false;
    }

    /**
     * Called when there has been a step through the timespan.
     */
     step() {}

     changeSelection() {}
    
    // To be used when converting from a node object with unnecessary content, to a person object used by the event functions
    formatNodeForSelection(node){

        if(node.emailsSent === undefined || node.emailsReceived === undefined){
            node.emailsSent = [];
            node.emailsReceived = [];
            let emails = this.main.dataHandler.getEmailsForPerson(node.id);
            console.log(emails);
            emails.forEach(email => {
                if(email.fromId === node.id){
                    node.emailsSent.push(this.formatEmail(email));
                }
                else if(email.toId === node.id){
                    node.emailsReceived.push(this.formatEmail(email));
                }
            })
        }

        return{
            id: node.id,
            name: node.name,
            jobtitle: node.jobtitle,
            emailsSent: node.emailsSent,
            emailsReceived: node.emailsReceived

        }
    }

    formatEmail = (email) => 
    { 
        return{
            jobtitles: {
                source: email.fromJobtitle,
                target: email.toJobtitle,
            },
            ids: {
                source: email.fromId,
                target: email.toId,
            },
            sentiment: email.sentiment,     
            date: email.date,
            id: email.id,
        }
    }

    
}