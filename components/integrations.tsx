"use client";
import { Chip } from "@nextui-org/react";
import React from "react";

function Integrations() {
  return (
    <div className="flex-col justify-center items-center mx-auto relative text-center">
      <div className="flex justify-center items-center text-cente mb-2">
        <Chip variant="flat" color="secondary">
          Contact Us
        </Chip>
      </div>
      <h1 className="text-2xl lg:text-4xl font-semibold z-10 relative">
        Have further queries?
      </h1>
      <h1 className="text-lg lg:text-xl font-normal z-10 relative max-w-[600px] text-center flex mx-auto justify-center items-center text-gray-500 mt-2">
        Reach out to us via our social media handles or drop an email. We are punctual with our users.
      </h1>

      <img alt="integration" className="mt-4 lg:mt-10" src="/integration.svg" />
    </div>
  );
}

export default Integrations;
