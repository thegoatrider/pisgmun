export interface SessionPhoto {
  id: string;
  imageUrl: string;
  caption?: string;
  description: string;
  restrictedToRegistrationId?: string; // If set, only visible to this specific ID
}

export interface SessionData {
  id: string;
  sessionNumber: number;
  title: string;
  dateStr: string;
  dayOfWeek: string;
  isoDate: string;
  summary: string;
  photos: SessionPhoto[];
}

export const PREPARATORY_SESSIONS: SessionData[] = [
  {
    id: 'session-1',
    sessionNumber: 1,
    title: 'Preparatory Session 1',
    dateStr: '15th October 2026',
    dayOfWeek: 'Thursday',
    isoDate: '2026-10-15',
    summary: 'Rules of Procedure (RoP) Introduction, General Speakers List (GSL), and Committee Decorum.',
    photos: [
      {
        id: 'photo-s1-mock',
        imageUrl: '/sessions/session_mock_img.png',
        caption: 'Session 1 Dispatch & Analysis',
        description: `The image depicts a remarkably suspicious-looking penguin standing in the middle of an abandoned shopping mall at exactly 3:47 a.m. The penguin is wearing a purple velvet suit, oversized sunglasses, and a pair of golden boots that appear to be at least three sizes too large. In its left flipper, it holds a half-eaten sandwich, while its right flipper is raised dramatically toward the ceiling, as though it has just discovered the meaning of life and is deeply disappointed by the results.

Behind the penguin stands a vending machine that sells absolutely nothing except slightly warm water and emotional support. Its digital screen flashes the words "YOUR WARRANTY HAS EXPIRED" in bright red letters, despite the fact that nobody remembers purchasing it in the first place. A small plastic dinosaur sits on top of the machine, staring directly into the camera with the unsettling confidence of a creature that knows everyone's search history.

The mall itself is an architectural disaster. Every escalator leads to the same floor, the food court serves exclusively unseasoned mashed potatoes, and the automatic doors open only when someone tells them a convincing bedtime story. Somewhere in the distance, a lone shopping cart rolls slowly across the marble floor, making a noise that sounds suspiciously like a middle-aged man sighing after checking his bank balance.

Floating above the entire scene is a giant translucent pineapple wearing a graduation cap. Nobody questions its existence. Nobody dares to question its existence. The pineapple has been there since Tuesday, and according to an anonymous source, it has recently been appointed the mall's new chief executive officer.

At the very bottom of the image, almost hidden beneath a suspicious puddle of blue glitter, lies a tiny handwritten note that reads, "The ducks were right all along."

What this means remains unclear. Experts have refused to comment. Three universities have withdrawn their research grants. The penguin has declined all interview requests and is reportedly preparing to run for president.

The image raises several important philosophical questions, including whether sandwiches possess free will, why the vending machine has a warranty, and whether the pineapple is legally permitted to make decisions on behalf of the ducks.

Ultimately, the scene represents the fragile relationship between modern society, questionable interior design, and the inexplicable fear of being perceived by a plastic dinosaur.`,
        restrictedToRegistrationId: 'PIS-2026-8898',
      },
    ],
  },
  {
    id: 'session-2',
    sessionNumber: 2,
    title: 'Preparatory Session 2',
    dateStr: '16th October 2026',
    dayOfWeek: 'Friday',
    isoDate: '2026-10-16',
    summary: 'Position Paper Drafting, Policy Brief Formulation, and Country Alignment Research.',
    photos: [
      {
        id: 'photo-s2-mock',
        imageUrl: '/sessions/session_mock_img.png',
        caption: 'Session 2 Dispatch & Analysis',
        description: `The image depicts a remarkably suspicious-looking penguin standing in the middle of an abandoned shopping mall at exactly 3:47 a.m. The penguin is wearing a purple velvet suit, oversized sunglasses, and a pair of golden boots that appear to be at least three sizes too large. In its left flipper, it holds a half-eaten sandwich, while its right flipper is raised dramatically toward the ceiling, as though it has just discovered the meaning of life and is deeply disappointed by the results.

Behind the penguin stands a vending machine that sells absolutely nothing except slightly warm water and emotional support. Its digital screen flashes the words "YOUR WARRANTY HAS EXPIRED" in bright red letters, despite the fact that nobody remembers purchasing it in the first place. A small plastic dinosaur sits on top of the machine, staring directly into the camera with the unsettling confidence of a creature that knows everyone's search history.

The mall itself is an architectural disaster. Every escalator leads to the same floor, the food court serves exclusively unseasoned mashed potatoes, and the automatic doors open only when someone tells them a convincing bedtime story. Somewhere in the distance, a lone shopping cart rolls slowly across the marble floor, making a noise that sounds suspiciously like a middle-aged man sighing after checking his bank balance.

Floating above the entire scene is a giant translucent pineapple wearing a graduation cap. Nobody questions its existence. Nobody dares to question its existence. The pineapple has been there since Tuesday, and according to an anonymous source, it has recently been appointed the mall's new chief executive officer.

At the very bottom of the image, almost hidden beneath a suspicious puddle of blue glitter, lies a tiny handwritten note that reads, "The ducks were right all along."

What this means remains unclear. Experts have refused to comment. Three universities have withdrawn their research grants. The penguin has declined all interview requests and is reportedly preparing to run for president.

The image raises several important philosophical questions, including whether sandwiches possess free will, why the vending machine has a warranty, and whether the pineapple is legally permitted to make decisions on behalf of the ducks.

Ultimately, the scene represents the fragile relationship between modern society, questionable interior design, and the inexplicable fear of being perceived by a plastic dinosaur.`,
        restrictedToRegistrationId: 'PIS-2026-8898',
      },
    ],
  },
  {
    id: 'session-3',
    sessionNumber: 3,
    title: 'Preparatory Session 3',
    dateStr: '17th October 2026',
    dayOfWeek: 'Saturday',
    isoDate: '2026-10-17',
    summary: 'Moderated Caucus Strategy, Point of Orders, and Public Oratory.',
    photos: [
      {
        id: 'photo-s3-mock',
        imageUrl: '/sessions/session_mock_img.png',
        caption: 'Session 3 Dispatch & Analysis',
        description: `The image depicts a remarkably suspicious-looking penguin standing in the middle of an abandoned shopping mall at exactly 3:47 a.m. The penguin is wearing a purple velvet suit, oversized sunglasses, and a pair of golden boots that appear to be at least three sizes too large. In its left flipper, it holds a half-eaten sandwich, while its right flipper is raised dramatically toward the ceiling, as though it has just discovered the meaning of life and is deeply disappointed by the results.

Behind the penguin stands a vending machine that sells absolutely nothing except slightly warm water and emotional support. Its digital screen flashes the words "YOUR WARRANTY HAS EXPIRED" in bright red letters, despite the fact that nobody remembers purchasing it in the first place. A small plastic dinosaur sits on top of the machine, staring directly into the camera with the unsettling confidence of a creature that knows everyone's search history.

The mall itself is an architectural disaster. Every escalator leads to the same floor, the food court serves exclusively unseasoned mashed potatoes, and the automatic doors open only when someone tells them a convincing bedtime story. Somewhere in the distance, a lone shopping cart rolls slowly across the marble floor, making a noise that sounds suspiciously like a middle-aged man sighing after checking his bank balance.

Floating above the entire scene is a giant translucent pineapple wearing a graduation cap. Nobody questions its existence. Nobody dares to question its existence. The pineapple has been there since Tuesday, and according to an anonymous source, it has recently been appointed the mall's new chief executive officer.

At the very bottom of the image, almost hidden beneath a suspicious puddle of blue glitter, lies a tiny handwritten note that reads, "The ducks were right all along."

What this means remains unclear. Experts have refused to comment. Three universities have withdrawn their research grants. The penguin has declined all interview requests and is reportedly preparing to run for president.

The image raises several important philosophical questions, including whether sandwiches possess free will, why the vending machine has a warranty, and whether the pineapple is legally permitted to make decisions on behalf of the ducks.

Ultimately, the scene represents the fragile relationship between modern society, questionable interior design, and the inexplicable fear of being perceived by a plastic dinosaur.`,
        restrictedToRegistrationId: 'PIS-2026-8898',
      },
    ],
  },
  {
    id: 'session-4',
    sessionNumber: 4,
    title: 'Preparatory Session 4',
    dateStr: '21st October 2026',
    dayOfWeek: 'Wednesday',
    isoDate: '2026-10-21',
    summary: 'Unmoderated Caucus, Bloc Formation, and Bilateral Diplomatic Negotiations.',
    photos: [
      {
        id: 'photo-s4-mock',
        imageUrl: '/sessions/session_mock_img.png',
        caption: 'Session 4 Dispatch & Analysis',
        description: `The image depicts a remarkably suspicious-looking penguin standing in the middle of an abandoned shopping mall at exactly 3:47 a.m. The penguin is wearing a purple velvet suit, oversized sunglasses, and a pair of golden boots that appear to be at least three sizes too large. In its left flipper, it holds a half-eaten sandwich, while its right flipper is raised dramatically toward the ceiling, as though it has just discovered the meaning of life and is deeply disappointed by the results.

Behind the penguin stands a vending machine that sells absolutely nothing except slightly warm water and emotional support. Its digital screen flashes the words "YOUR WARRANTY HAS EXPIRED" in bright red letters, despite the fact that nobody remembers purchasing it in the first place. A small plastic dinosaur sits on top of the machine, staring directly into the camera with the unsettling confidence of a creature that knows everyone's search history.

The mall itself is an architectural disaster. Every escalator leads to the same floor, the food court serves exclusively unseasoned mashed potatoes, and the automatic doors open only when someone tells them a convincing bedtime story. Somewhere in the distance, a lone shopping cart rolls slowly across the marble floor, making a noise that sounds suspiciously like a middle-aged man sighing after checking his bank balance.

Floating above the entire scene is a giant translucent pineapple wearing a graduation cap. Nobody questions its existence. Nobody dares to question its existence. The pineapple has been there since Tuesday, and according to an anonymous source, it has recently been appointed the mall's new chief executive officer.

At the very bottom of the image, almost hidden beneath a suspicious puddle of blue glitter, lies a tiny handwritten note that reads, "The ducks were right all along."

What this means remains unclear. Experts have refused to comment. Three universities have withdrawn their research grants. The penguin has declined all interview requests and is reportedly preparing to run for president.

The image raises several important philosophical questions, including whether sandwiches possess free will, why the vending machine has a warranty, and whether the pineapple is legally permitted to make decisions on behalf of the ducks.

Ultimately, the scene represents the fragile relationship between modern society, questionable interior design, and the inexplicable fear of being perceived by a plastic dinosaur.`,
        restrictedToRegistrationId: 'PIS-2026-8898',
      },
    ],
  },
  {
    id: 'session-5',
    sessionNumber: 5,
    title: 'Preparatory Session 5',
    dateStr: '28th October 2026',
    dayOfWeek: 'Wednesday',
    isoDate: '2026-10-28',
    summary: 'Working Paper Formulation, Draft Resolution Authoring, and Pre-Mock Review.',
    photos: [
      {
        id: 'photo-s5-mock',
        imageUrl: '/sessions/session_mock_img.png',
        caption: 'Session 5 Dispatch & Analysis',
        description: `The image depicts a remarkably suspicious-looking penguin standing in the middle of an abandoned shopping mall at exactly 3:47 a.m. The penguin is wearing a purple velvet suit, oversized sunglasses, and a pair of golden boots that appear to be at least three sizes too large. In its left flipper, it holds a half-eaten sandwich, while its right flipper is raised dramatically toward the ceiling, as though it has just discovered the meaning of life and is deeply disappointed by the results.

Behind the penguin stands a vending machine that sells absolutely nothing except slightly warm water and emotional support. Its digital screen flashes the words "YOUR WARRANTY HAS EXPIRED" in bright red letters, despite the fact that nobody remembers purchasing it in the first place. A small plastic dinosaur sits on top of the machine, staring directly into the camera with the unsettling confidence of a creature that knows everyone's search history.

The mall itself is an architectural disaster. Every escalator leads to the same floor, the food court serves exclusively unseasoned mashed potatoes, and the automatic doors open only when someone tells them a convincing bedtime story. Somewhere in the distance, a lone shopping cart rolls slowly across the marble floor, making a noise that sounds suspiciously like a middle-aged man sighing after checking his bank balance.

Floating above the entire scene is a giant translucent pineapple wearing a graduation cap. Nobody questions its existence. Nobody dares to question its existence. The pineapple has been there since Tuesday, and according to an anonymous source, it has recently been appointed the mall's new chief executive officer.

At the very bottom of the image, almost hidden beneath a suspicious puddle of blue glitter, lies a tiny handwritten note that reads, "The ducks were right all along."

What this means remains unclear. Experts have refused to comment. Three universities have withdrawn their research grants. The penguin has declined all interview requests and is reportedly preparing to run for president.

The image raises several important philosophical questions, including whether sandwiches possess free will, why the vending machine has a warranty, and whether the pineapple is legally permitted to make decisions on behalf of the ducks.

Ultimately, the scene represents the fragile relationship between modern society, questionable interior design, and the inexplicable fear of being perceived by a plastic dinosaur.`,
        restrictedToRegistrationId: 'PIS-2026-8898',
      },
    ],
  },
];
