import mockSessionImg from '../assets/session_mock_img.png';
import session1Photo1 from '../assets/session_15oct_1.jpg';
import session1Photo2 from '../assets/session_15oct_2.jpg';
import session1Photo3 from '../assets/session_15oct_3.jpg';
import session1Photo4 from '../assets/session_15oct_4.jpg';

export interface SessionPhoto {
  id: string;
  imageUrl: string;
  caption?: string;
  description: string;
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

const session1Description = `On 15th October, a comprehensive preparatory session for PISGMUN (PISG Model United Nations) was conducted to familiarise students with the overall structure, flow, and expectations of the upcoming programme. The primary objective of the session was to ensure that all participating students developed a clear understanding of how a Model United Nations conference functions and the various stages involved in the proceedings. During the session, students were introduced to the sequence of activities, committee procedures, rules of debate, and the important points to be kept in mind while participating in discussions. The resource persons explained the significance of maintaining diplomatic decorum, respecting differing perspectives, presenting arguments logically, and communicating ideas with clarity and confidence. Special emphasis was placed on the importance of thorough research, understanding the assigned agenda, gathering relevant information, and developing well-structured points to support one's arguments. Students were also guided on how to express their opinions effectively, participate constructively in formal discussions, listen attentively to fellow delegates, and respond to opposing viewpoints in a respectful and diplomatic manner. The session highlighted that Model United Nations is not merely an opportunity to speak in front of an audience, but also a platform to develop critical thinking, negotiation skills, leadership qualities, teamwork, and a deeper understanding of international affairs and global issues. Through the explanations and interactive discussions, students gained valuable insights into the practical aspects of the programme and were encouraged to approach the conference with preparation, responsibility, and an open mind. The session proved to be an important orientation exercise, helping students clarify their doubts, understand the expectations associated with their participation, and become more confident about the proceedings. Overall, the PISGMUN preparatory session conducted on 15th October was a meaningful and informative initiative that laid a strong foundation for the upcoming event, motivating students to participate enthusiastically and make the most of this enriching learning experience.`;

const mockDescription = `The image depicts a remarkably suspicious-looking penguin standing in the middle of an abandoned shopping mall at exactly 3:47 a.m. The penguin is wearing a purple velvet suit, oversized sunglasses, and a pair of golden boots that appear to be at least three sizes too large. In its left flipper, it holds a half-eaten sandwich, while its right flipper is raised dramatically toward the ceiling, as though it has just discovered the meaning of life and is deeply disappointed by the results.

Behind the penguin stands a vending machine that sells absolutely nothing except slightly warm water and emotional support. Its digital screen flashes the words "YOUR WARRANTY HAS EXPIRED" in bright red letters, despite the fact that nobody remembers purchasing it in the first place. A small plastic dinosaur sits on top of the machine, staring directly into the camera with the unsettling confidence of a creature that knows everyone's search history.

The mall itself is an architectural disaster. Every escalator leads to the same floor, the food court serves exclusively unseasoned mashed potatoes, and the automatic doors open only when someone tells them a convincing bedtime story. Somewhere in the distance, a lone shopping cart rolls slowly across the marble floor, making a noise that sounds suspiciously like a middle-aged man sighing after checking his bank balance.

Floating above the entire scene is a giant translucent pineapple wearing a graduation cap. Nobody questions its existence. Nobody dares to question its existence. The pineapple has been there since Tuesday, and according to an anonymous source, it has recently been appointed the mall's new chief executive officer.

At the very bottom of the image, almost hidden beneath a suspicious puddle of blue glitter, lies a tiny handwritten note that reads, "The ducks were right all along."

What this means remains unclear. Experts have refused to comment. Three universities have withdrawn their research grants. The penguin has declined all interview requests and is reportedly preparing to run for president.

The image raises several important philosophical questions, including whether sandwiches possess free will, why the vending machine has a warranty, and whether the pineapple is legally permitted to make decisions on behalf of the ducks.

Ultimately, the scene represents the fragile relationship between modern society, questionable interior design, and the inexplicable fear of being perceived by a plastic dinosaur.`;

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
        id: 'photo-s1-1',
        imageUrl: session1Photo1,
        caption: 'Preparatory Session 1 - Introduction to Procedures and Conference Flow',
        description: session1Description,
      },
      {
        id: 'photo-s1-2',
        imageUrl: session1Photo2,
        caption: 'Delegate Cohort in Formal Orientation & Discussion',
        description: session1Description,
      },
      {
        id: 'photo-s1-3',
        imageUrl: session1Photo3,
        caption: 'Diplomatic Decorum, Debate Sequence, and Committee Rules',
        description: session1Description,
      },
      {
        id: 'photo-s1-4',
        imageUrl: session1Photo4,
        caption: 'Agenda Research, Points of Inquiry, and Position Preparation',
        description: session1Description,
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
        imageUrl: mockSessionImg,
        caption: 'Session 2 Dispatch & Analysis',
        description: mockDescription,
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
        imageUrl: mockSessionImg,
        caption: 'Session 3 Dispatch & Analysis',
        description: mockDescription,
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
        imageUrl: mockSessionImg,
        caption: 'Session 4 Dispatch & Analysis',
        description: mockDescription,
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
        imageUrl: mockSessionImg,
        caption: 'Session 5 Dispatch & Analysis',
        description: mockDescription,
      },
    ],
  },
];
