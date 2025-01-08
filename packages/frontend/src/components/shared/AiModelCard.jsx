import React, { useState } from "react";
import { MessageBadges } from "."; // Ensure this import is correct

const AiModelCard = ({ models }) => {
  const [rotatedCard, setRotatedCard] = useState(null);

  const handleRotate = (id) => {
    setRotatedCard(id === rotatedCard ? null : id);
  };

  return (
    <section className="py-16 mx-auto sm:py-20">
      <div className="mx-auto flex justify-center object-center px-4 py-16 sm:py-24 lg:max-w-7xl">
        <div className="flex justify-center object-center flex-col gap-12 sm:gap-16">
          <h2 className="text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
            Services
          </h2>
          <div className="mx-auto grid gap-12 space-y-10 md:space-y-0 sm:gap-16 lg:grid-cols-3">
            {models?.map((service) => {
              const isRotated = rotatedCard === service.name;

              return (
                <div key={service.name} className="group h-96 w-96 [perspective:1000px]">
                  <div
                    className={`relative h-full w-full rounded-xl shadow-xl transition-all duration-500 [transform-style:preserve-3d] ${isRotated ? "rotate-y-180" : ""}`}
                  >
                    {/* Front Face */}
                    <div className="absolute inset-0 h-full w-full rounded-xl [backface-visibility:hidden]">
                      {service.avatar && (
                        <img
                          className="object-cover cursor-pointer object-left h-full w-full rounded-xl"
                          src={service.avatar}
                          alt={service.name}
                          width={320}
                          height={320}
                        />
                      )}
                      <p className="md:my-6 text-2xl">{service.name}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card from rotating on card click
                          handleRotate(service.name);
                        }}
                        className="absolute top-4 right-4 bg-blue-600 text-white px-2 py-1 rounded-full text-sm"
                      >
                        Rotate
                      </button>
                    </div>

                    {/* Back Face */}
                    <div className="absolute inset-0 h-full w-full rounded-xl bg-black/80 px-12 text-center text-slate-200 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                      <div className="flex min-h-full flex-col items-center justify-center">
                        <h2 className="text-2xl font-bold mb-4">{service.name}</h2>
                        <p className="text-lg text-pretty text-center mb-4">{service.description}</p>
                        <a href="tel:555-555-5555" className="inline-flex">
                          <button className="my-2 bg-yellow-800 hover:bg-yellow-700 text-white font-bold py-2 px-4 w-auto rounded-full inline-flex items-center">
                            <span>Schedule Service</span>
                          </button>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Message Badges visible when the card is rotated */}
                  {isRotated && (
                    <div className="absolute inset-0 h-full overflow-y-auto w-full rounded-xl bg-black/80 px-12 text-center text-slate-200">
                      <MessageBadges data={service?.aiType} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export { AiModelCard };
