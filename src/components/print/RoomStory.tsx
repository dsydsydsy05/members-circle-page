import { useRef, type CSSProperties, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { clamp, useScrollProgress } from "@/components/print/use-scroll-progress";

type Room = {
  no: string;
  year: string;
  name: string;
  place: string;
  who?: string;
  story: ReactNode;
  photo?: { src: string; alt: string; caption: string; focus?: string };
  // Our own room swaps the photograph and the credits line for its own content.
  aside?: ReactNode;
  details?: ReactNode;
};

// Each fact here is checked against Wikipedia; photo credits are listed at the end of the page.
const ROOMS: Room[] = [
  {
    no: "01",
    year: "1924",
    name: "The laundry room",
    place: "Herzogenaurach, Germany",
    who: "Adi & Rudolf Dassler",
    story: (
      <>
        Adi Dassler made sports shoes in his mother’s laundry room. In 1924 his brother Rudolf
        joined, and the room became the Gebrüder Dassler Schuhfabrik. In 1949 the brothers split it
        in two. One room became <b>Adidas</b>. The other became <b>Puma</b>.
      </>
    ),
    photo: {
      src: "/images/rooms/dassler-factory-1928.jpg",
      alt: "The Gebrüder Dassler shoe factory in 1928",
      caption: "The Dassler factory, 1928",
    },
  },
  {
    no: "02",
    year: "1939",
    name: "The garage",
    place: "367 Addison Avenue, Palo Alto",
    who: "Bill Hewlett & David Packard",
    story: (
      <>
        Two Stanford graduates and a one-car garage. It is a California Historical Landmark now,
        known as <b>the birthplace of Silicon Valley</b>, and it is still just a garage.
      </>
    ),
    photo: {
      src: "/images/rooms/hp-garage.jpg",
      alt: "The HP garage at 367 Addison Avenue, Palo Alto",
      caption: "The HP garage, Palo Alto",
    },
  },
  {
    no: "03",
    year: "1976",
    name: "The garage",
    place: "Crist Drive, Los Altos",
    who: "Steve Jobs & Steve Wozniak",
    story: (
      <>
        A three-bedroom family house in Los Altos, a workbench a father built for his son, and the
        first <b>Apple</b> computers.
      </>
    ),
    photo: {
      src: "/images/rooms/apple-garage.jpg",
      alt: "The Jobs family house and garage on Crist Drive, Los Altos",
      caption: "Crist Drive, Los Altos",
    },
  },
  {
    no: "04",
    year: "1984",
    name: "Room 2713",
    place: "Dobie Center, Austin, Texas",
    who: "Michael Dell",
    story: (
      <>
        A pre-med freshman selling PC upgrade kits from his dorm room. At 19 he left university to
        run <b>Dell</b>. Nineteen years later he came back to the same campus to tell its graduates
        to find a different room.
      </>
    ),
    photo: {
      src: "/images/rooms/dobie-center.jpg",
      alt: "The Dobie Center residence tower in Austin, Texas",
      caption: "Dobie Center, Austin",
      focus: "50% 30%",
    },
  },
  {
    no: "05",
    year: "1994",
    name: "The garage",
    place: "Bellevue, Washington",
    who: "Jeff Bezos",
    story: (
      <>
        On July 5, 1994, an online bookshop opened in the garage of a rented house in Bellevue. It
        became <b>Amazon</b>.
      </>
    ),
    photo: {
      src: "/images/rooms/amazon-garage.jpg",
      alt: "The garage in Bellevue where Amazon was founded",
      caption: "The garage, Bellevue",
    },
  },
  {
    no: "06",
    year: "1998",
    name: "The garage",
    place: "Menlo Park, California",
    who: "Larry Page & Sergey Brin",
    story: (
      <>
        Two Stanford PhD students rented a friend’s garage while they set up a search engine. The
        friend, Susan Wojcicki, later ran YouTube. The search engine was <b>Google</b>.
      </>
    ),
    photo: {
      src: "/images/rooms/google-garage.jpg",
      alt: "The Menlo Park house and garage where Google started",
      caption: "Menlo Park, California",
    },
  },
  {
    no: "07",
    year: "2007",
    name: "The living room",
    place: "San Francisco",
    who: "Brian Chesky & Joe Gebbia",
    story: (
      <>
        Two roommates who could not make rent put an air mattress in their living room during a
        design conference and called it Air Bed &amp; Breakfast. It became <b>Airbnb</b>.
      </>
    ),
    photo: {
      src: "/images/rooms/air-bed.jpg",
      alt: "An inflated air bed in the corner of a room",
      caption: "An air bed, not the original",
    },
  },
  {
    no: "08",
    year: "2026",
    name: "The Room",
    place: "Boston, Massachusetts",
    story: (
      <>
        A founder community born in Boston in 2026, built on Dell’s rule: a room where you are never
        the smartest person in it.
      </>
    ),
    // Rooms get outgrown: each line is set larger than the one before it.
    aside: (
      <div className="room-outgrow">
        <p className="room-mono">Then the room changes</p>
        <ul>
          <li style={{ "--step": 0 } as CSSProperties}>The dorm room gets too small.</li>
          <li style={{ "--step": 1 } as CSSProperties}>The garage gets too quiet.</li>
          <li style={{ "--step": 2 } as CSSProperties}>The office gets too comfortable.</li>
          <li style={{ "--step": 3 } as CSSProperties}>
            One day you are the smartest person in it.
          </li>
        </ul>
        <p className="room-outgrow__turn">That is when you need a different room.</p>
      </div>
    ),
    details: (
      <ol className="room-asks">
        <li>
          <span className="room-mono">01</span>A room to ask.
        </li>
        <li>
          <span className="room-mono">02</span>People who’ve done it before.
        </li>
        <li>
          <span className="room-mono">03</span>Capital, opportunities and resources.
        </li>
        <li>
          <span className="room-mono">04</span>Whatever you need next.
        </li>
      </ol>
    ),
  },
];

const CREDITS = [
  ["Small conference room", "Crew", "CC0"],
  ["The Dassler factory, 1928", "Unknown author", "Public domain"],
  ["HP garage front", "BrokenSphere", "CC BY-SA 3.0"],
  ["Apple Garage", "Mathieu Thouvenin", "CC BY-SA 2.0"],
  ["DobieCenter-May2009", "LoneStarMike", "CC BY-SA 3.0"],
  ["Amazon’s founding site in Bellevue, Washington – garage", "SounderBruce", "CC BY-SA 4.0"],
  ["Google garage", "Jordiipa", "CC BY-SA 3.0"],
  ["Air mattress or extra bed with internal air pump", "W.carter", "CC BY-SA 4.0"],
];

function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

// A torn-paper edge: a jagged slope from lower left to the top, then down the right side.
function tornEdge() {
  const rand = seeded(7);
  const points: string[] = ["0% 100%"];
  for (let i = 0; i <= 40; i += 1) {
    const t = i / 40;
    const x = t * 62 + (rand() - 0.5) * 2.2;
    const y = 100 - Math.pow(t, 0.7) * 96 + (rand() - 0.5) * 3;
    points.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
  }
  for (let i = 1; i <= 16; i += 1) {
    const t = i / 16;
    points.push(
      `${(62 + t * 38).toFixed(2)}% ${(4 + Math.sin(t * 5) * 2 + rand() * 3).toFixed(2)}%`,
    );
  }
  points.push("100% 100%");
  return `polygon(${points.join(", ")})`;
}
const TORN = tornEdge();

function Duotone({
  src,
  alt,
  focus,
  className = "",
}: {
  src: string;
  alt: string;
  focus?: string;
  className?: string;
}) {
  return (
    <span className={`room-duo ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        style={focus ? { objectPosition: focus } : undefined}
      />
    </span>
  );
}

function smooth(value: number) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

function RoomSlot({ room, distance }: { room: Room; distance: number }) {
  // Every part of a room blurs in and out together; the photo moves a little ahead of the rest.
  const style = (lag: number) =>
    ({
      opacity: clamp(1 - Math.abs(distance * (1 + lag)) * 1.7),
      filter: `blur(${(Math.abs(distance * (1 + lag)) * 18).toFixed(1)}px)`,
      transform: `translateY(${(distance * (1 + lag) * 24).toFixed(1)}px)`,
    }) as CSSProperties;
  const active = Math.abs(distance) < 0.5;
  return (
    <>
      <div className="room-slot room-slot--head" style={style(0)} aria-hidden={!active}>
        <span className="room-mono room-accent">Room {room.no}</span>
        <span className="room-mono">{room.place}</span>
      </div>
      <p className="room-slot room-year" style={style(0)} aria-hidden={!active}>
        {room.year}
      </p>
      <div className="room-slot room-slot--copy" style={style(0)} aria-hidden={!active}>
        <h3>{room.name}.</h3>
        <p>{room.story}</p>
        {room.details ?? (
          <dl>
            <div>
              <dt>In the room</dt>
              <dd>{room.who}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>{room.year}</dd>
            </div>
          </dl>
        )}
      </div>
      <div className="room-slot room-slot--photo" style={style(0.3)} aria-hidden={!active}>
        {room.aside ??
          (room.photo && (
            <figure>
              <Duotone src={room.photo.src} alt={room.photo.alt} focus={room.photo.focus} />
              <figcaption className="room-mono">
                Fig. {room.no} — {room.photo.caption}
              </figcaption>
            </figure>
          ))}
      </div>
    </>
  );
}

/**
 * The rooms share one pinned composition. The year, copy and photograph of each room stay in
 * fixed places and blur out and back in as you scroll.
 */
function RoomRun() {
  const runRef = useRef<HTMLElement>(null);
  const { progress, reduced } = useScrollProgress(runRef, 1);
  const last = ROOMS.length - 1;

  if (reduced) {
    return (
      <section className="room-run room-run--static" aria-label="A short history of rooms">
        {ROOMS.map((room) => (
          <div key={room.no} className="room-run__sticky">
            <RoomSlot room={room} distance={0} />
          </div>
        ))}
      </section>
    );
  }

  // Each room holds for half its step and spends the middle half turning to the next.
  const at = progress * (last + 0.6);
  const step = Math.min(last, Math.floor(at));
  const turn = step >= last ? 0 : smooth((at - step - 0.25) / 0.5);
  const position = step + turn;

  return (
    <section
      ref={runRef}
      className="room-run"
      style={{ "--rooms": ROOMS.length } as CSSProperties}
      aria-label="A short history of rooms"
    >
      <div className="room-run__sticky">
        {ROOMS.map((room, index) =>
          Math.abs(position - index) < 1 ? (
            <RoomSlot key={room.no} room={room} distance={index - position} />
          ) : null,
        )}
        <div className="room-run__counter" aria-hidden="true">
          {ROOMS.map((room, index) => (
            <i key={room.no} className={index <= Math.round(position) ? "is-on" : undefined} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function RoomStory() {
  return (
    <div className="room-story">
      <RoomRun />

      {/* Closing poster */}
      <section className="room-poster" aria-labelledby="room-poster-title">
        <h2 id="room-poster-title" className="print-visually-hidden">
          Find a different room
        </h2>
        <p className="room-poster__word room-poster__word--1" aria-hidden="true">
          Find a
        </p>
        <p className="room-poster__word room-poster__word--2" aria-hidden="true">
          different
        </p>
        <div className="room-poster__torn" style={{ clipPath: TORN }}>
          <Duotone src="/images/rooms/hp-garage.jpg" alt="" focus="50% 60%" />
        </div>
        <aside className="room-poster__side room-mono" aria-hidden="true">
          <span>TR / 08</span>
          <span>
            Boston,
            <br />
            Massachusetts
          </span>
          <span>
            Be in
            <br />
            the right
            <br />
            room
          </span>
        </aside>
        <p className="room-poster__word room-poster__word--3" aria-hidden="true">
          room<span className="room-accent">.</span>
        </p>
        <Link to="/auth" className="room-poster__cta">
          Enter The Room ↗
        </Link>
      </section>

      <footer className="room-credits">
        <div className="room-shell">
          <p className="room-mono">Photographs</p>
          <ul>
            {CREDITS.map(([title, author, license]) => (
              <li key={title}>
                “{title}” — {author}, {license}, via Wikimedia Commons. Monotone treatment by The
                Room{license.startsWith("CC BY") ? `, shared under ${license}.` : "."}
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
  );
}
