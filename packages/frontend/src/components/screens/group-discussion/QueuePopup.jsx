import React, { useState, useEffect, useRef } from "react";
import {
  ButtonIcon,
  DoubleTapPopup,
  IconContainer,
  Loader,
  RenderSpace,
  UserCard,
} from "../../shared";
import { useSelector, useDispatch } from "react-redux";
import Icon from "../../../icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { QUEUE_STATUS } from "../../../constants";
import { Button, TabComposed } from "../../ui";

const QueueSection = ({ children, ref, title, color }) => {
  const textColor = `text-${color}-500`;
  return (
    <div className="space-y-2">
      <p className={`text-left ${textColor}`} ref={ref}>
        {title}
      </p>
      {children}
    </div>
  );
};

const QueueCard = ({ item, handleDelete, nextInQueue }) => {
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
            isLoading={JSON.parse(
              localStorage.getItem("QUEUE-DELETE")
            )?.includes(item?._id)}
          />
        </RenderSpace>

        <RenderSpace condition={!nextInQueue}>
          <Icon
            name={QUEUE_STATUS[item?.status]?.icon}
            className={QUEUE_STATUS[item?.status]?.color}
          />
        </RenderSpace>

        <RenderSpace condition={item?.status === "NOT_STARTED" && !nextInQueue}>
          <IconContainer
            name="Drag"
            className="cursor-grab"
            containerClass="border-0"
          />
        </RenderSpace>
      </div>
    </div>
  );
};

const NotStartedList = ({ queue, handleOnDragEnd, handleDelete }) => {
  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <RenderSpace condition={queue?.notStarted?.length}>
        <div className="space-y-2 rounded-md h-48 overflow-y-auto">
          <Droppable droppableId="inner-queue">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {queue?.notStarted?.length > 0 ? (
                  queue?.notStarted?.map((item, index) => (
                    <Draggable
                      key={item._id}
                      draggableId={item._id.toString()}
                      index={index}
                      isDragDisabled={
                        item?.status !== "NOT_STARTED" &&
                        item?.status !== "IN_PROGRESS"
                      }
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="relative"
                          style={{
                            cursor:
                              item.status !== "NOT_STARTED" &&
                              item.status !== "IN_PROGRESS"
                                ? "not-allowed"
                                : "grab",
                            zIndex: snapshot.isDragging ? 1000 : "auto",
                          }}
                        >
                          <QueueCard item={item} handleDelete={handleDelete} />
                        </div>
                      )}
                    </Draggable>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center rounded-md">
                    No Participants in the queue
                  </div>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </RenderSpace>
    </DragDropContext>
  );
};

export function QueuePopup({ sessionId, error, isLoading, socket }) {
  const { queue = [] } = useSelector((state) => state.session);

  console.log({ queue });

  // Refs for scrolling to "In Progress" or "Not Started"
  const inProgressRef = useRef(null);
  const notStartedRef = useRef(null);

  useEffect(() => {
    // Scroll to "In Progress" first, if available, else scroll to "Not Started"
    if (inProgressRef.current) {
      inProgressRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    if (notStartedRef.current) {
      notStartedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [inProgressRef.current, notStartedRef.current, queue]); // Runs when queue updates

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

  const renderCurrent = () => {
    if (queue?.inProgress?._id) {
      return (
        <QueueSection title={"In Progress"} color="green">
          <QueueCard item={queue?.inProgress} />
        </QueueSection>
      );
    } else if (queue?.notStarted[0]) {
      return (
        <QueueSection title={"Next In the Queue"} color="yellow">
          <QueueCard item={queue?.notStarted[0]} nextInQueue />
        </QueueSection>
      );
    } else {
      return <p className="text-gray-500">No Participnts in the queue</p>;
    }
  };

  const TAB_LIST = [
    {
      id: "notStarted",
      label: "Not Started",
      icon: "QueueStack",
      iconStyle: "text-purple-500",
      component: (
        <NotStartedList
          queue={queue}
          handleOnDragEnd={handleOnDragEnd}
          handleDelete={handleDelete}
        />
      ),
    },
    {
      id: "started",
      label: "Discussion Done",
      icon: "Correct",
      iconStyle: "text-green-500",
      component: (
        <div className="space-y-2 my-2 rounded-md">
          {queue?.done?.length > 0 ? (
            queue?.done?.map((item) => <QueueCard key={item._id} item={item} />)
          ) : (
            <div className="h-full flex items-center justify-center rounded-md">
              No Participants in the list
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="absolute drop-shadow-2xl z-50">
      <DoubleTapPopup
        onKey="q"
        draggable
        iconName="QueueStack"
        title="Discussion Queue"
        containerClass="bg-violet-600"
      >
        <div>
          <div className="flex justify-end items-center w-full">
            <ButtonIcon
              variant="ghost"
              onClick={handleClearAll}
              disabled={!queue?.notStarted?.length || isLoading}
              name="LoadArrow"
              iconClassName={"text-red-900 font-bold text-[24px]"}
            />
          </div>

          <div className="bg-gray-900 flex-grow  w-full rounded-md space-y-2">
            {isLoading ? (
              <div className="h-full flex items-center justify-center rounded-md">
                <Loader text="Queue is Loding" />
              </div>
            ) : !queue?.done?.length &&
              !queue?.notStarted?.length &&
              !queue?.inProgress?._id ? (
              <div className="h-full flex items-center justify-center rounded-md">
                No Participants added
              </div>
            ) : (
              <TabComposed defaultTab="notStarted" list={TAB_LIST} />
            )}
          </div>

          <RenderSpace
            condition={
              isLoading ||
              queue?.done?.length ||
              queue?.notStarted?.length ||
              queue?.inProgress?._id
            }
          >
            <div className="bg-gray-900 w-full p-4 rounded-md">
              {renderCurrent()}
            </div>
          </RenderSpace>
        </div>
      </DoubleTapPopup>
    </div>
  );
}
