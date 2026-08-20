export interface GuideChapters {
  issue: string;
  importance: string;
  stats: string;
  frameworks: string;
  positions: string;
  cases: string;
}

export const backgroundGuides: Record<string, GuideChapters> = {
  unep: {
    issue: `
      <h4>A. Understanding the Issue</h4>
      <p>The world faces a major energy and environmental challenge. Countries across Africa, Asia, Latin America, and parts of Europe continue to rely heavily on fossil fuels like coal, diesel, and biomass for electricity generation and household energy needs. This dependence has contributed to severe air pollution, greenhouse gas emissions, and major public health concerns.</p>
      <p>At the same time, millions of people in rural and low-income communities still lack reliable access to electricity. Solar energy has emerged as a promising solution because large parts of the world receive abundant sunlight year-round. Solar power can reduce dependence on fossil fuels, improve air quality, and increase access to clean and affordable electricity.</p>
      <p>However, equitable access remains a challenge. Wealthier urban populations and businesses are increasingly adopting solar technology, while poorer communities often struggle due to high installation costs, weak infrastructure, lack of financing, and limited awareness.</p>
    `,
    importance: `
      <h4>B. Why is this Important Globally?</h4>
      <p>Clean energy is directly connected to climate change, economic development, public health, and global sustainability. Many regions of the world suffer from dangerous levels of air pollution, and improving access to renewable energy is essential to reducing pollution and achieving international climate goals.</p>
      <ul>
        <li><strong>Public Health:</strong> Air pollution causes millions of premature deaths annually.</li>
        <li><strong>Climate Change:</strong> Fossil fuels are a major source of greenhouse gas emissions.</li>
        <li><strong>Economic Development:</strong> Renewable energy can create green jobs and improve energy security.</li>
        <li><strong>Energy Equality:</strong> Solar energy can bring electricity to remote and underserved communities.</li>
        <li><strong>SDG 7:</strong> The UN aims to ensure affordable and clean energy for all by 2030.</li>
      </ul>
    `,
    stats: `
      <h4>C. Key Statistics & Trends</h4>
      <ul>
        <li>Over 700 million people worldwide still lack access to electricity, mostly in Sub-Saharan Africa and parts of Asia.</li>
        <li>Air pollution contributes to approximately 7 million premature deaths globally every year, according to the WHO.</li>
        <li>Global solar capacity crossed 1,000 GW in 2022 and continues to grow rapidly.</li>
        <li>Countries like Morocco, Kenya, and Chile have become global leaders in solar energy adoption among developing nations.</li>
        <li>The World Bank estimates that transitioning to clean energy could add $26 trillion to the global economy by 2030.</li>
      </ul>
    `,
    frameworks: `
      <h4>D. UN Actions and Frameworks</h4>
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">I. Stockholm Conference (1972)</strong>
          <span>Led to the creation of UNEP and encouraged countries to consider environmental protection alongside development. It recognised that economic development and environmental protection must work together.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">II. Agenda 21 and Earth Summit (1992)</strong>
          <span>Encouraged countries to adopt sustainable development strategies and cleaner energy systems. Its main outcome was Agenda 21, a global action plan.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">III. Kyoto Protocol (1997)</strong>
          <span>An international agreement aimed at reducing greenhouse gas emissions. Developed countries were given legally binding emission reduction targets.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">IV. Paris Agreement (2015)</strong>
          <span>Countries are committed to reducing emissions and limiting global warming through national climate action plans called Nationally Determined Contributions (NDCs).</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">V. Sustainable Development Goal 7</strong>
          <span>Focuses on ensuring access to affordable, reliable, sustainable, and modern energy for all by 2030.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">VI. International Solar Alliance (ISA)</strong>
          <span>Launched by India and France in 2015 to promote the adoption of solar energy, especially in countries with high solar potential.</span>
        </div>
      </div>
    `,
    positions: `
      <h4>E. Country Positions</h4>
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">1. India</strong>
          <span>A regional leader in solar energy and co-founded the ISA. India launched the National Solar Mission in 2010 to increase solar power generation. Key initiatives: PM-KUSUM, Rooftop Solar Programme, One Sun One World One Grid.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">2. Kenya</strong>
          <span>A leading example of solar adoption in Sub-Saharan Africa. The country has invested heavily in off-grid solar solutions to bring electricity to rural communities and is recognised for its pay-as-you-go financing models.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">3. Morocco</strong>
          <span>Ambitious solar leader, home to the Noor Ouarzazate Solar Complex — one of the largest solar power plants on earth. The country aims to generate 52% of its electricity from renewables by 2030.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">4. Brazil</strong>
          <span>Strong renewable base (primarily hydropower) and expanding into solar. High solar irradiation makes it well-positioned. Key policy: ProGD Rooftop Solar Programme.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">5. Germany</strong>
          <span>Global leader in policy (Energiewende strategy). Significant investments in solar power, Renewable Energy Sources Act (EEG), feed-in tariffs. Target: carbon neutrality by 2045.</span>
        </div>
      </div>
    `,
    cases: `
      <h4>F. Case Studies & List of Agendas</h4>
      <h5>Case Studies:</h5>
      <ul>
        <li><strong>India – PM-KUSUM Scheme:</strong> Supports solar-powered agricultural pumps and decentralised renewable systems.</li>
        <li><strong>Kenya – M-KOPA Solar:</strong> Globally recognised pay-as-you-go solar model that has brought electricity to over 3 million homes in East Africa.</li>
        <li><strong>Morocco – Noor Solar Complex:</strong> One of the world's largest concentrated solar power plants.</li>
      </ul>
      <h5>List of Agendas:</h5>
      <ul>
        <li>Should governments subsidise solar energy for low-income households?</li>
        <li>Can countries cooperate despite political tensions?</li>
        <li>Should solar energy projects prioritise rural and underserved communities?</li>
        <li>How can countries balance economic growth with environmental sustainability?</li>
      </ul>
    `
  },
  unicef: {
    issue: `
      <h4>A. Understanding the Issue</h4>
      <p>Many low-income countries depend heavily on foreign aid to support child healthcare, vaccination drives, nutrition programs, and medical infrastructure. Organisations such as UNICEF, WHO, GAVI, and donor countries have historically funded immunisation campaigns, healthcare clinics, and emergency services in these regions.</p>
      <p>Recent reductions in foreign aid have created major challenges for healthcare systems already struggling with poverty, conflict, and weak infrastructure. These cuts may lead to vaccine shortages, the closure of rural clinics, reduced access to healthcare, and an increased risk of preventable diseases.</p>
      <p>Millions of children rely on externally funded healthcare systems for survival. Without strong healthcare systems and immunisation programs, countries may face increased child mortality, disease outbreaks, and long-term developmental setbacks.</p>
    `,
    importance: `
      <h4>B. Why is this Important Globally?</h4>
      <p>Child healthcare and immunisation are directly connected to global health security, economic stability, human rights, and sustainable development. In an interconnected world, healthcare crises in one region can quickly affect other parts of the world through disease outbreaks, migration pressures, and economic instability.</p>
      <ul>
        <li><strong>Public Health:</strong> Vaccination programs protect millions of children from preventable diseases like measles, polio, and cholera.</li>
        <li><strong>Global Health Security:</strong> Weak healthcare systems increase the risk of infectious diseases spreading across borders.</li>
        <li><strong>Economic Development:</strong> Healthy children are more likely to attend school, develop skills, and contribute positively to the economy.</li>
        <li><strong>Human Rights:</strong> The UN Convention on the Rights of the Child states that every child has the right to healthcare, nutrition, and medical support.</li>
        <li><strong>SDG 3:</strong> Ensure healthy lives and promote well-being for all at all ages by 2030.</li>
      </ul>
    `,
    stats: `
      <h4>C. Key Statistics & Trends</h4>
      <ul>
        <li>At least 14 million children across the globe face disruptions to nutrition services in 2025 due to funding cuts.</li>
        <li>2.5 million additional child deaths are projected from aid cessation between 2025-2030, according to a study by The Lancet.</li>
        <li>16.8 million pregnant women annually lose USAID-supported maternal care.</li>
        <li>479 health facilities are at risk of closure globally.</li>
      </ul>
    `,
    frameworks: `
      <h4>D. UN Frameworks for Child Health and Nutrition</h4>
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">I. Convention on the Rights of the Child (1989)</strong>
          <span>One of the most widely ratified treaties in history. It recognises that every child has the right to healthcare, nutrition, education, protection, and development.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">II. Millennium Development Goals (MDGs) (2000–2015)</strong>
          <span>Targets adopted by the UN in 2000. Two major goals focused on reducing child mortality and improving maternal health.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">III. Sustainable Development Goal 3 (SDG 3)</strong>
          <span>Aims to "Ensure healthy lives and promote well-being for all at all ages" by 2030, reducing child mortality and improving vaccination access.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">IV. GAVI – The Vaccine Alliance</strong>
          <span>Established in 2000 to improve access to vaccines in low-income countries, supporting immunization infrastructure and vaccine financing.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">V. COVAX Initiative</strong>
          <span>Launched during the COVID-19 pandemic to ensure fair and equal global access to vaccines, co-led by WHO, UNICEF, GAVI, and CEPI.</span>
        </div>
      </div>
    `,
    positions: `
      <h4>E. Country Positions</h4>
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">1. United States</strong>
          <span>Historically one of the largest contributors through USAID and the CDC. American funding supports vaccination, PEPFAR (AIDS relief), and maternal care. Debates exist over foreign aid spending.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">2. United Kingdom</strong>
          <span>Traditionally a major supporter through Official Development Assistance (ODA). Recent reductions in UK foreign aid budgets have raised concerns about the future of several child welfare programs.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">3. India</strong>
          <span>Important healthcare and pharmaceutical partner. Supplying affordable vaccines and medicines through initiatives like Vaccine Maitri. Promotes South-South cooperation.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">4. China</strong>
          <span>Significantly expanded healthcare diplomacy and infrastructure investments in Africa through bilateral agreements and the Belt and Road Initiative, supporting hospital construction and donations.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">5. Sub-Saharan African Nations</strong>
          <span>Heavily dependent on international funding. Governments are increasingly calling for stronger local vaccine manufacturing, sustainable financing, and healthcare worker training to reduce aid dependence.</span>
        </div>
      </div>
    `,
    cases: `
      <h4>F. Case Studies & List of Agendas</h4>
      <h5>Case Studies:</h5>
      <ul>
        <li><strong>Somalia – Nutrition Centre Closures:</strong> Aid reductions forced centers to shut down, putting children at risk.</li>
        <li><strong>Malawi – Vaccine Shortages:</strong> Faced challenges due to shortages in vaccines and infrastructure.</li>
        <li><strong>Nigeria – Maternal & Child Health:</strong> Aid cuts directly affected maternal services.</li>
        <li><strong>Rwanda – Digital Health Systems:</strong> Invested in digital vaccination tracking.</li>
      </ul>
      <h5>List of Agendas:</h5>
      <ul>
        <li>Should foreign aid for children healthcare come under a condition compelling recipient countries to build domestic healthcare capacity?</li>
        <li>Is there a possibility of a globally agreed notice period or a transition plan before a major donor withdraws funding?</li>
        <li>Can other countries create a multination framework to counter reduced aid from traditional Western donor countries?</li>
      </ul>
    `
  },
  fao: {
    issue: `
      <h4>A. Understanding the Issue</h4>
      <p>Conflict is today the single biggest driver of hunger in the world. Wars destroy farms, block food deliveries, collapse economies, displace families, and prevent humanitarian aid from reaching people. When fighting breaks out, farmers cannot tend fields, markets shut down, and agricultural infrastructure (irrigation, livestock) is deliberately targeted.</p>
      <p>The communities most affected are often the most vulnerable — children, women, the elderly, and refugees. Food insecurity in conflict zones causes malnutrition, disease, child mortality, and long-term developmental harm.</p>
      <p>Recovering food systems takes years. Even when fighting stops, landmines contaminate agricultural land, and economic collapse makes rebuilding nearly impossible without sustained international support.</p>
    `,
    importance: `
      <h4>B. Why is this Important Globally?</h4>
      <p>Food insecurity in conflict areas is directly connected to humanitarian crises, global migration, economic instability, and long-term development. Hunger caused by conflict does not stay within borders — it drives refugee movements and destabilises neighbouring countries.</p>
      <ul>
        <li><strong>Public Health:</strong> Malnutrition weakens immune systems and causes millions of preventable deaths, especially among children under five.</li>
        <li><strong>Human Rights:</strong> Access to food is a fundamental human right recognised by the UN.</li>
        <li><strong>Global Migration:</strong> Food insecurity is one of the leading causes of forced displacement.</li>
        <li><strong>Economic Development:</strong> Hunger reduces productivity, disrupts education, and traps communities in poverty.</li>
        <li><strong>SDG 2:</strong> The UN aims to achieve Zero Hunger globally by 2030. Conflict is the single greatest obstacle.</li>
      </ul>
    `,
    stats: `
      <h4>C. Key Statistics & Trends</h4>
      <ul>
        <li>As of 2024, approximately 282 million people across 59 countries face acute food insecurity, with conflict being the primary driver.</li>
        <li>Around 60% of the world's hungry people live in countries affected by conflict and fragility.</li>
        <li>People in conflict zones are up to 20 times more likely to face severe hunger than those in stable countries (WFP).</li>
        <li>Child wasting — a severe form of malnutrition — affects over 13 million children in conflict-affected regions.</li>
        <li>The economic cost of hunger caused by conflict is estimated at over $3.5 trillion annually in lost productivity.</li>
      </ul>
    `,
    frameworks: `
      <h4>D. UN Actions and Frameworks</h4>
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">I. Universal Declaration of Human Rights (1948)</strong>
          <span>Established the right to an adequate standard of living, including food, as a fundamental human right.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">II. Rome Declaration on World Food Security (1996)</strong>
          <span>World leaders committed to halving the number of hungry people by 2015, strengthening FAO's monitoring role.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">III. UN Security Council Resolution 2417 (2018)</strong>
          <span>The first UNSC resolution to explicitly link conflict and food insecurity, condemning the use of starvation as a weapon of war and declaring it a war crime.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">IV. Sustainable Development Goal 2 – Zero Hunger</strong>
          <span>Commits UN member states to ending hunger, achieving food security, and promoting sustainable agriculture by 2030.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">V. The Sendai Framework for Disaster Risk Reduction (2015)</strong>
          <span>Promotes resilient food systems, early warning mechanisms, and rapid humanitarian response, highly relevant to conflict areas.</span>
        </div>
      </div>
    `,
    positions: `
      <h4>E. Country Positions</h4>
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">1. Yemen</strong>
          <span>Experiencing one of the worst food crises, driven by civil war. Conflict has destroyed agricultural infrastructure and blocked imports. Yemen imports over 90% of basic food. Heavily dependent on food aid.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">2. Sudan</strong>
          <span>SAF vs RSF conflict (2023) has displaced millions. Farmland has been abandoned and food markets collapsed, pushing the nation to the brink of famine. Demands ceasefires and humanitarian corridors.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">3. Democratic Republic of Congo (DRC)</strong>
          <span>Fertile land but complex crisis due to eastern armed groups. Active UN peacekeeping mission (MONUSCO) is present. Needs local market support and smallholder protection.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">4. Ukraine</strong>
          <span>Major grain exporter. Conflict devastated farm fields and grain exports. Supported the UN-brokered Black Sea Grain Initiative to protect maritime trade corridors.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">5. Ethiopia</strong>
          <span>Overlapping crises: Tigray conflict and recurring drought. Demands post-conflict agricultural recovery funding and early warning systems.</span>
        </div>
      </div>
    `,
    cases: `
      <h4>F. Case Studies & List of Agendas</h4>
      <h5>Case Studies:</h5>
      <ul>
        <li><strong>Yemen – WFP Emergency Food Assistance:</strong> Largest humanitarian food operation, reaching millions in conflict zones with food rations.</li>
        <li><strong>DRC – FAO Smallholder Agricultural Recovery:</strong> Focuses on restoring agricultural livelihoods for displaced families by providing seeds, tools, and training.</li>
        <li><strong>Ukraine – Black Sea Grain Initiative:</strong> Allowed grain exports through safe maritime corridors (2022-2023).</li>
      </ul>
      <h5>List of Agendas:</h5>
      <ul>
        <li>Should humanitarian food aid be guaranteed safe passage through active conflict zones under international law?</li>
        <li>Can the international community hold warring parties legally accountable for the deliberate destruction of food systems?</li>
        <li>Should post-conflict agricultural recovery be included as a mandatory component of UN peace agreements?</li>
        <li>How can FAO improve early warning systems to prevent food crises before famine occurs?</li>
      </ul>
    `
  },
  unhrc: {
    issue: `
      <h4>A. Understanding the Topic</h4>
      <p>During political and regional conflicts, governments often shut down the internet, block social media, and monitor civilians' data to control the spread of misinformation and hate. Additionally, during wartime, crucial digital systems such as power grids, healthcare networks, and banking services can be targets for attacks.</p>
      <p>As a result, ordinary people suffer, losing their rights to express themselves, and their privacy and safety are at risk. Therefore, it is essential to create and implement clear policies and frameworks to protect digital safety, privacy, and the right to express opinions worldwide during conflicts.</p>
      
      <h5>Key Highlights of Issues:</h5>
      <ul>
        <li><strong>Cyber operations & civilian infrastructure:</strong> Cyberattacks on power, water, health, banking, or telecom during war. Are these allowed?</li>
        <li><strong>Surveillance, data collection & privacy:</strong> Mass surveillance, facial recognition, phone tracking, data gathering.</li>
        <li><strong>Information space & harmful content:</strong> Disinformation, propaganda, and online hate that incites violence vs protecting free speech.</li>
        <li><strong>Civilians, hackers & tech companies:</strong> "Hacktivists" sharing military data; tech companies choosing sides or acting like digital superpowers.</li>
        <li><strong>Protection of humanitarian organizations:</strong> Cyberattacks on humanitarian agencies' sensitive civilian data (e.g., ICRC, UN).</li>
      </ul>
    `,
    importance: `
      <h4>B. Understanding Your Country and its Laws</h4>
      <p>Every delegate must analyze their country's internet landscape, telecom dependencies, history of conflicts, and constitutional protections on privacy and free expression to determine if they are "pro-rights" or "security-focused".</p>
      <ul>
        <li><strong>Constitutional Protections:</strong> Rights to privacy, expression, access to information (and derogation clauses during emergencies).</li>
        <li><strong>Data Protection & Privacy Laws:</strong> Scope of data laws, government surveillance exemptions, rules on biometric databases.</li>
        <li><strong>Cybersecurity Strategies:</strong> Laws on hacking, cyberwarfare, and protection of critical infrastructure.</li>
        <li><strong>Telecom Regulations:</strong> Who controls the internet in a crisis? Can the government order shutdowns or blocking?</li>
      </ul>
    `,
    stats: `
      <h4>C. Relevant International Law and Norms</h4>
      <p>Every delegate should connect their policies with international agreements:</p>
      <ul>
        <li><strong>Human Rights Treaties:</strong> Universal Declaration of Human Rights, International Covenant on Civil and Political Rights (ICCPR) articles on privacy and emergency limitations.</li>
        <li><strong>International Humanitarian Law (IHL):</strong> Geneva Conventions principles applied to cyber operations (distinction between civilian and military targets, proportionality, necessity).</li>
        <li><strong>Regional Systems:</strong> European Court of Human Rights decisions on surveillance and wartime data collection (e.g. Ukraine-Russia cases), African and Inter-American positions.</li>
      </ul>
    `,
    frameworks: `
      <h4>D. Reports and resources that students can read</h4>
      <ul>
        <li><strong>ICRC – "Protecting Civilians against Digital Threats during Armed Conflict":</strong> Explains how cyber operations, harmful info, civilian hackers, and attacks on humanitarian organisations threaten civilians and suggests guiding principles.</li>
        <li><strong>ICRC & Geneva Academy – "Civilian Involvement in Digitalising Armed Conflicts":</strong> Analyses civilians and tech companies participating in cyber operations and legal consequences under IHL.</li>
        <li><strong>CCDCOE – "The Rights to Privacy and Data Protection in Times of Armed Conflict":</strong> Discusses how modern warfare affects privacy and data protection, and gaps in current law.</li>
      </ul>
    `,
    positions: `
      <h4>E. Specific Information to be Researched</h4>
      <ul>
        <li><strong>The country's voting record and statements:</strong> Look for speech transripts, UN votes, or declarations on Cybersecurity, Internet freedom, Digital surveillance, and the Protection of civilians online.</li>
        <li><strong>Allies, blocs, and typical stance:</strong> Does the country support strong human rights language or security-heavy language? Regional groups: EU, African Union, ASEAN, Arab League, NATO.</li>
        <li><strong>Policy proposals the country might support:</strong> Transparency and oversight of surveillance; Limits on cyberattacks against civilian infrastructure; Protection of journalists, activists, and humanitarian data; Corporate responsibility for tech companies in war.</li>
      </ul>
    `,
    cases: `
      <h4>F. List of Agendas</h4>
      <ul>
        <li>To what extent can states limit digital rights (privacy, free expression, access to information) in the name of national security during conflict?
          <ul>
            <li>Are internet shutdowns or social media blocks ever justified to stop violence and disinformation, or do they always harm civilians more than they help?</li>
            <li>Should emergency powers for surveillance and data collection automatically expire after conflict?</li>
          </ul>
        </li>
        <li>Should international law explicitly ban cyber operations that affect civilian digital infrastructure (health systems, power grids, banking, telecom) during armed conflict?</li>
        <li>How far can governments and humanitarian actors go in collecting and using personal and biometric data (e.g., refugees, IDPs, aid recipients) during conflict?</li>
        <li>What responsibilities should technology companies (social media, cloud, telecom) have in protecting digital rights during conflict?</li>
      </ul>
    `
  },
  'un-women': {
    issue: `
      <h4>A. Understanding the Issue</h4>
      <p>Women’s rights are human rights that ensure equality, dignity, and freedom for women and girls in all spheres of life—social, economic, and political. Despite progress over the past decades, gender inequality persists due to deeply rooted structural and cultural barriers.</p>
      <h5>Key challenges include:</h5>
      <ul>
        <li><strong>Limited access to quality education:</strong> particularly in rural and conflict-affected areas.</li>
        <li><strong>Workplace discrimination:</strong> including wage gaps and a lack of leadership opportunities.</li>
        <li><strong>Gender-based violence (GBV):</strong> including domestic violence, trafficking, and early marriage.</li>
        <li><strong>Underrepresentation:</strong> in governance and decision-making bodies.</li>
      </ul>
      <p>These challenges are often reinforced by poverty, conflict, and discriminatory laws. Women’s empowerment is not only a rights issue but also a development and justice concern.</p>
    `,
    importance: `
      <h4>B. Why is it important globally?</h4>
      <p>Gender equality is central to global development and is explicitly recognised in Sustainable Development Goal 5. Empowering women has a multiplier effect across societies:</p>
      <ul>
        <li><strong>Economic Growth:</strong> Increasing women's workforce participation can significantly boost global GDP (World Bank).</li>
        <li><strong>Social Development:</strong> Educated women contribute to improved health, education, and well-being of families.</li>
        <li><strong>Governance:</strong> Greater female participation leads to more inclusive and effective policymaking.</li>
        <li><strong>Peace and Security:</strong> Involving women in peace processes increases the likelihood of lasting peace agreements.</li>
      </ul>
    `,
    stats: `
      <h4>C. Key Statistics & Trends</h4>
      <ul>
        <li>Women earn approximately 20% less than men globally (UN Women, 2024).</li>
        <li>133 million girls are out of school worldwide (UNESCO, 2023).</li>
        <li>1 in 3 women experience physical or sexual violence (WHO/UN Women).</li>
        <li>Women perform three times more unpaid domestic work than men (UNDP).</li>
        <li>Women hold only 30% of leadership positions globally (ILO/UN Women).</li>
        <li>It may take over 130 years to achieve full gender equality (World Economic Forum, 2024).</li>
      </ul>
    `,
    frameworks: `
      <h4>D. UN Actions and Frameworks</h4>
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">I. Convention on the Elimination of All Forms of Discrimination Against Women (CEDAW, 1979)</strong>
          <span>CEDAW is the primary international legal framework, often referred to as the international bill of rights for women. Countries that ratify it are legally obligated to eliminate discrimination in education, employment, healthcare, and political participation.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">II. Beijing Declaration and Platform for Action (1995)</strong>
          <span>Adopted at the Fourth World Conference on Women, this is one of the most comprehensive global policy frameworks for gender equality, identifying 12 critical areas of concern (poverty, education, health, violence, etc.).</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">III. Sustainable Development Goal 5 (SDG 5)</strong>
          <span>Part of the 2030 Agenda, SDG 5 aims to "achieve gender equality and empower all women and girls," targeting an end to child marriage, discrimination, and violence.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">IV. UN Security Council Resolution 1325 (2000)</strong>
          <span>This landmark resolution focuses on Women, Peace, and Security (WPS), emphasizing participation in peace negotiations, protection from violence, prevention of conflict, and gender-sensitive rebuilding.</span>
        </div>
      </div>
    `,
    positions: `
      <h4>E. Country Positions</h4>
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">1. United States</strong>
          <span>Strong advocate for women's global empowerment programs, but debates occur on federal funding and specific reproductive health policies.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">2. India</strong>
          <span>Enacted Beti Bachao Beti Padhao (girls' education), maternal health support, and legislative representation rules, but challenges remain in rural enforcement and gender pay gaps.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">3. Saudi Arabia</strong>
          <span>Recent legal reforms allowing women to drive and travel independently have increased workforce participation, but traditional guardianship structures are still being addressed.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">4. Mexico</strong>
          <span>Strong legislative framework against gender violence and femicide, but faces challenges with enforcement, corruption, and protective services.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">5. Sub-Saharan African Nations</strong>
          <span>Focusing on eliminating child marriage and increasing access to primary/secondary education, while dealing with infrastructure, poverty, and conflict barriers.</span>
        </div>
      </div>
    `,
    cases: `
      <h4>F. Case Studies & List of Agendas</h4>
      <h5>Case Studies:</h5>
      <ul>
        <li><strong>India – Beti Bachao Beti Padhao:</strong> National education initiative aimed at addressing child sex ratio and promoting girls' schooling.</li>
        <li><strong>Saudi Arabia – Driving & Economic Reforms:</strong> Opened new sectors for female employment.</li>
        <li><strong>Mexico – Femicide Laws:</strong> Highlighted structural enforcement gaps despite strong statutory protections.</li>
      </ul>
      <h5>List of Agendas:</h5>
      <ul>
        <li>"Laws for women's rights exist, but they are not effectively implemented." How can international bodies enforce compliance?</li>
        <li>Should governments prioritize girls' education over other economic development goals?</li>
        <li>Should countries introduce mandatory quotas for female representation in national parliaments?</li>
        <li>Which is more effective in reducing gender-based violence: stronger punishments or long-term education?</li>
      </ul>
    `
  },
  ecosoc: {
    issue: `
      <h4>A. Understanding the Issue</h4>
      <p>As digital technologies expand globally, food supply chains are undergoing a major transition. E-commerce platforms allow farmers to connect directly with wholesale buyers and consumers, bypassing multiple middle-tier traders. This direct access holds the potential to increase rural household incomes and lower transaction costs.</p>
      <p>However, unequal access to digital technology, high logistic costs for fast delivery, food safety inspection standards, packaging waste, and weak cold-chain storage infrastructure represent major bottlenecks for smallholder farmers in developing nations. ECOSOC must address how digital technologies can be scaled sustainably without widening inequalities.</p>
    `,
    importance: `
      <h4>B. Why is this Important Globally?</h4>
      <p>Direct farmer-to-consumer e-commerce is connected to economic growth, food security, and waste reduction. Over 30% of global food produced is lost or wasted, much of it due to logistics inefficiency in the supply chain.</p>
      <ul>
        <li><strong>Rural Incomes:</strong> Connecting smallholder farmers to high-value urban markets.</li>
        <li><strong>Supply Logistics:</strong> Improving cold storage tracking and routing to reduce post-harvest waste.</li>
        <li><strong>SDG 12:</strong> Ensuring sustainable consumption and production patterns.</li>
        <li><strong>Food Security:</strong> Direct digital coordination prevents supply chain blockages during crises.</li>
      </ul>
    `,
    stats: `
      <h4>C. Key Statistics & Trends</h4>
      <ul>
        <li>Global e-commerce food and grocery sales grew by over 30% since 2021, and are projected to double by 2030.</li>
        <li>In developing countries, post-harvest losses due to logistics and cold-chain deficits reach up to 40% of produce.</li>
        <li>Smallholder farmers represent 80% of agricultural production in Sub-Saharan Africa and Asia, but less than 15% use digital platforms due to high internet costs.</li>
      </ul>
    `,
    frameworks: `
      <h4>D. Actions and Frameworks</h4>
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">I. UNCTAD Digital Economy Reports</strong>
          <span>Provides guidelines for developing countries to build robust e-commerce policy frameworks and improve rural internet connectivity.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">II. FAO E-Agriculture Strategy</strong>
          <span>Assists member nations in integrating ICTs into agricultural development plans, promoting digital literacy among farmers.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">III. SDG 12 (Responsible Consumption & Production)</strong>
          <span>Targets halving global per capita food waste at retail and consumer levels and reducing food losses along production and supply chains.</span>
        </div>
      </div>
    `,
    positions: `
      <h4>E. Country Positions</h4>
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">1. India</strong>
          <span>Launched the e-National Agriculture Market (eNAM) to integrate wholesale markets digitally, but struggles with rural internet speeds and cold storage facilities.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">2. United States & EU</strong>
          <span>Highly advanced online grocery ecosystems, but face concerns regarding massive packaging waste, carbon footprint of last-mile deliveries, and safety standards.</span>
        </div>
        <div>
          <strong style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">3. Kenya</strong>
          <span>Pioneered mobile money solutions (M-Pesa) which enables farmers to perform mobile trade directly, though transportation infrastructure remains an obstacle.</span>
        </div>
      </div>
    `,
    cases: `
      <h4>F. Case Studies & List of Agendas</h4>
      <h5>Case Studies:</h5>
      <ul>
        <li><strong>China – Taobao Villages:</strong> Rural administrative hubs trained in e-commerce, allowing direct farm sales to urban markets.</li>
        <li><strong>India – eNAM Wholesale Market:</strong> Created a unified national market for agricultural commodities to ensure fair pricing.</li>
      </ul>
      <h5>List of Agendas:</h5>
      <ul>
        <li>Should ECOSOC recommend global regulatory standards for digital food safety inspection?</li>
        <li>How can developing nations bridge the digital divide for smallholder rural farmers?</li>
        <li>Balancing packaging waste from online deliveries with international sanitation requirements.</li>
      </ul>
    `
  }
};
