import React, { useState, useEffect, useRef } from "react";
import {
  DoubleTapPopup,
  IconContainer,
  RenderSpace,
  UserCard,
} from "../../shared";
import { useSelector, useDispatch } from "react-redux";
import Icon from "../../../icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { QUEUE_STATUS } from "../../../constants";
import { Button } from "../../ui";

const QueueCard = ({ item, handleDelete }) => {
  return (
    <div className="p-2 flex gap-2 items-center justify-between bg-gray-800 drop-shadow-2xl rounded-md">
      <div className="w-[58%]">
        <UserCard {...item} />
      </div>
      <div className="flex gap-2 items-center">
        <RenderSpace condition={item?.status === "NOT_STARTED"}>
          <IconContainer
            name="Delete"
            className="text-red-500"
            containerClass="hover:bg-red-400 border-red-700"
            onClick={() => handleDelete(item)}
            isLoading={JSON.parse(localStorage.getItem("QUEUE-DELETE"))?.includes(item?._id)}
          />
        </RenderSpace>
        <Icon
          name={QUEUE_STATUS[item?.status]?.icon}
          className={QUEUE_STATUS[item?.status]?.color}
        />
        <RenderSpace condition={item?.status === "NOT_STARTED"}>
          <IconContainer name="Drag" className="cursor-grab" containerClass="border-0" />
        </RenderSpace>
      </div>
    </div>
  );
};

export function QueuePopup({ sessionId, error, isLoading, socket }) {
  const { queue = [] } = useSelector((state) => state.session);
  const dispatch = useDispatch();

  // Refs for scrolling to "In Progress" or "Not Started"
  const inProgressRef = useRef(null);
  const notStartedRef = useRef(null);

  useEffect(() => {
    // Scroll to "In Progress" first, if available, else scroll to "Not Started"
    if (inProgressRef.current) {
      inProgressRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }  if (notStartedRef.current) {
      notStartedRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [inProgressRef.current,notStartedRef.current,queue]); // Runs when queue updates

  const handleOnDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const items = Array.from(queue);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);

    socket.emit("DISCUSSION_QUEUE", {
      action: "ORDER",
      sessionId,
      sourceIndex: source.index,
      destinationIndex: destination.index,
    });
  };

  const handleClearAll = () =>
    socket.emit("DISCUSSION_QUEUE", {
      action: "CLEAR",
      sessionId,
      currentQueue: queue?.length || 0,
    });

  const handleDelete = (item) => {
    let queueDelete = JSON.parse(localStorage.getItem("QUEUE-DELETE")) || [];
    queueDelete.push(item._id);
    localStorage.setItem("QUEUE-DELETE", JSON.stringify(queueDelete));

    socket.emit("DISCUSSION_QUEUE", {
      action: "DELETE",
      _id: item?._id,
      userId: item?.userId,
      sessionId,
    });
  };

  return (
    <div className="relative drop-shadow-2xl z-50">
      <DoubleTapPopup onKey="q">
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="outer-queue" direction="horizontal">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="absolute">
                <Draggable key="outer-draggable" draggableId="outer-draggable" index={0}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="absolute h-96 w-96 space-y-2 flex flex-col justify-center items-center inset-4 bg-green-700 z-50 rounded-md"
                      style={{ cursor: "grab" }}
                    >
                      <div className="flex justify-between w-full items-center px-4">
                        <p>Discussion Queue</p>
                        <Button variant="destructive" onClick={handleClearAll}>
                          Clear All
                        </Button>
                      </div>

                      {/* Scrollable queue container */}
                      <div className="bg-gray-900 space-y-2 h-[82%] w-[90%] overflow-y-scroll rounded-b-md p-4 rounded-md">

                        {/* Done Section */}
                        <RenderSpace condition={queue?.done?.length}>
                          <div className="space-y-2 my-2 rounded-md">
                            <p className="text-left p-2 text-yellow-500">Done</p>
                            {queue?.done?.map((item) => (
                              <QueueCard key={item._id} item={item} />
                            ))}
                          </div>
                        </RenderSpace>

                        <RenderSpace condition={queue?.inProgress}>
                          <div  className="space-y-2 my-2 rounded-md">
                            <p className="text-left p-2 text-green-500"  ref={inProgressRef}>In Progress</p>
                            <QueueCard item={queue?.inProgress} />
                          </div>
                        </RenderSpace>

                        <RenderSpace condition={queue?.notStarted?.length}>
                          <div  className="space-y-2 my-2 rounded-md">
                            <p className="text-left p-2 text-purple-500" ref={notStartedRef}>Not Started</p>
                            <Droppable droppableId="inner-queue">
                              {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                  {queue?.notStarted?.map((item, index) => (
                                    <Draggable
                                      key={item._id}
                                      draggableId={item._id.toString()}
                                      index={index}
                                      isDragDisabled={item?.status !== "NOT_STARTED" && item?.status !== "IN_PROGRESS"}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className="relative"
                                          style={{
                                            cursor:
                                              item.status !== "NOT_STARTED" && item.status !== "IN_PROGRESS"
                                                ? "not-allowed"
                                                : "grab",
                                            zIndex: snapshot.isDragging ? 1000 : "auto",
                                          }}
                                        >
                                          <QueueCard item={item} handleDelete={handleDelete} />
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        </RenderSpace>
                      </div>
                    </div>
                  )}
                </Draggable>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </DoubleTapPopup>
    </div>
  );
}
