document.addEventListener("DOMContentLoaded", () => {

    const graph = document.getElementsByClassName("graph")[0];
    let clickedPos = {
        x: 0,
        y: 0
    }
    graph.transformPos = {
        x: 0,
        y: 0
    }

    let draggingElement = {};
    function drag(event) {
        draggingElement.style.transform = `translate(${draggingElement.transformPos.x + event.pageX - clickedPos.x}px, ${draggingElement.transformPos.y + event.pageY - clickedPos.y}px)`;
    }
    // function pan(event) {
    //     graph.style.transform = `translate(${transformPos.x + event.pageX - clickedPos.x}px, ${transformPos.y + event.pageY - clickedPos.y}px)`;
    // }
    // function makeDraggable(element) {
    //     element.addEventListener("mousemove", drag);

    //     element.addEventListener("mouseup", (event) => {
    //         element.transformPos.x += event.pageX - clickedPos.x;
    //         element.transformPos.y += event.pageY - clickedPos.y; 
    //         document.removeEventListener("mousemove", drag);
    //         }, {once: true});
    // }

    document.addEventListener("mousedown", (event) => {
        clickedPos.x = event.pageX;
        clickedPos.y = event.pageY;

        if (event.target.classList.contains("node")) {
            draggingElement = event.target;
        }
        else if (event.target.parentElement.classList.contains("node")) {
            draggingElement = event.target.parentElement;
        }
        else {
            draggingElement = graph;
        }

        document.addEventListener("mousemove", drag);
        
        document.addEventListener("mouseup", (event) => {
            draggingElement.transformPos.x += event.pageX - clickedPos.x;
            draggingElement.transformPos.y += event.pageY - clickedPos.y; 
            document.removeEventListener("mousemove", drag);
        }, {once: true});
    });
});