import Draggabilly from "draggabilly";




export function createDraggabilly(draggableElement: HTMLElement, container?: HTMLElement): HTMLElement {
    const containerToPlace = container ?? document.body

    const draggabilly = new Draggabilly(draggableElement, {containment: containerToPlace})

    return draggableElement
}