import { Link } from "@nextui-org/link";
import { button as buttonStyles } from "@nextui-org/theme";
import { title } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import PrototypeImg from "@/components/prototype-img";
import FeaturesBento from "@/components/feature-bento";
import LightBg from "@/components/light-bg";
import Integrations from "@/components/integrations";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 ">
      <div className="inline-block max-w-sm lg:max-w-4xl text-center justify-center text-2xl">
        <h1 className={title({ size: "lg" })}>Make&nbsp;</h1>
        <h1 className={title({ color: "violet", size: "lg" })}>
          Beautiful&nbsp;
        </h1>
        <br />
        <h1 className={title({ size: "lg" })}>Websites using Easy NextUI</h1>
        <h2 className="font-normal text-gray-500 py-2">
          Beautiful, fast and modern Easy UI template.
        </h2>
      </div>

      <div className="flex gap-3">
        <Link
          isExternal
          className={buttonStyles({ variant: "bordered", radius: "full" })}
          href={"https://github.com/AmanWasti9/AI-ChatBot"}
        >
          <GithubIcon size={20} />
          GitHub
        </Link>
      </div>
      <PrototypeImg />
      <div className="mt-20 lg:mt-60 flex-col justify-center items-center mx-auto">
        <h1 className="text-2xl lg:text-4xl font-semibold flex- justify-center items-center mx-auto text-center">
          Features
        </h1>
        <FeaturesBento />
      </div>
      <LightBg />
      <Integrations />
    </section>
  );
}
