import { Heading, NcImage } from "@repo/design-system/ciseco";

export interface People {
  avatar: string;
  id: string;
  job: string;
  name: string;
}

const FOUNDER_DEMO: People[] = [
  {
    id: "1",
    name: `Niamh O'Shea`,
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
    job: "Co-founder and Chief Executive",
  },
  {
    id: "4",
    name: `Danien Jame`,
    avatar:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
    job: "Co-founder and Chief Executive",
  },
  {
    id: "3",
    name: `Orla Dwyer`,
    avatar:
      "https://images.unsplash.com/photo-1560365163-3e8d64e762ef?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
    job: "Co-founder, Chairman",
  },
  {
    id: "2",
    name: `Dara Frazier`,
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80",
    job: "Co-Founder, Chief Strategy Officer",
  },
];

const SectionFounder = () => {
  return (
    <div className="nc-SectionFounder relative">
      <Heading
        description="We’re impartial and independent, and every day we create distinctive,
          world-class programmes and content"
      >
        ⛱ Founder
      </Heading>
      <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {FOUNDER_DEMO.map((item) => (
          <div key={item.id} className="max-w-sm">
            <NcImage
              containerClassName="relative aspect-square rounded-xl overflow-hidden"
              className="object-cover"
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              src={item.avatar}
            />
            <h3 className="mt-4 text-lg font-semibold text-neutral-900 md:text-xl dark:text-neutral-200">
              {item.name}
            </h3>
            <span className="block text-sm text-neutral-500 sm:text-base dark:text-neutral-400">
              {item.job}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionFounder;
