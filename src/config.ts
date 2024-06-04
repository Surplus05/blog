import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://surplus-dev.com/", // replace this with your deployed domain
  author: "Surplus",
  desc: "St.kim Blog",
  title: "Surplus.Dev",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerPage: 6,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
};

export const LOCALE = {
  lang: "kr", // html lang code. Set this empty and default will be "en"
  langTag: ["ko-KR"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/Surplus05",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:sungtae1005@gmail.com",
    linkTitle: ``,
    active: true,
  },
];
