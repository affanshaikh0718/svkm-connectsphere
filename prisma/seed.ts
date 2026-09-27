import { PrismaClient, UserRole, UserStatus, EmploymentType, LocationType, PostType, PostVisibility, ConnectionStatus, FollowTargetType, CompanyMemberRole, JobStatus, ExperienceLevel, ApplicationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SVKM database seed...');

  // Clean existing data in reverse order of dependencies
  await prisma.auditLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.jobSkill.deleteMany();
  await prisma.job.deleteMany();
  await prisma.companyMember.deleteMany();
  await prisma.company.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationMember.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.savedPost.deleteMany();
  await prisma.commentLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.postMedia.deleteMany();
  await prisma.post.deleteMany();
  await prisma.block.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.project.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.skillEndorsement.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.education.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.privacySettings.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password@123', 10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

  // 1. Create Skills
  const skillNames = [
    'Data Structures & Algorithms', 'TypeScript', 'JavaScript', 'React', 'Next.js',
    'Node.js', 'NestJS', 'PostgreSQL', 'Redis', 'Python', 'FastAPI', 'Docker',
    'Machine Learning', 'C++', 'Java', 'Git', 'System Design', 'Cloud Computing'
  ];

  const skillsMap: Record<string, string> = {};
  for (const name of skillNames) {
    const skill = await prisma.skill.create({ data: { name, category: 'Engineering' } });
    skillsMap[name] = skill.id;
  }

  // 2. Create Admin User (SVKM Network Admin & Placement Coordinator)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@svkm.ac.in',
      username: 'svkmadmin',
      firstName: 'SVKM',
      lastName: 'Administrator',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          headline: 'Chief Administrator & Placement Cell Coordinator | SVKM Ecosystem',
          bio: 'Managing ConnectSphere - the official professional networking and placement platform for Shri Vile Parle Kelavani Mandal (SVKM) institutions.',
          location: 'Vile Parle West, Mumbai',
        },
      },
      privacySettings: { create: {} },
    },
  });

  // 3. User 1: SVKM Student (MPSTME)
  const studentUser = await prisma.user.create({
    data: {
      email: 'rohan.mehta@svkm.ac.in',
      username: 'rohanmehta',
      firstName: 'Rohan',
      lastName: 'Mehta',
      passwordHash,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          headline: 'B.Tech Computer Engineering @ MPSTME, SVKM | Full-Stack & Systems Enthusiast',
          bio: 'Final year Computer Engineering student at Mukesh Patel School of Technology Management and Engineering (MPSTME). Actively seeking campus placement and SDE roles. Passionate about DSA, distributed systems, and modern web architectures.',
          location: 'Mumbai, Maharashtra',
          isOpenToWork: true,
          openToWorkTypes: ['FULL_TIME', 'INTERNSHIP'],
          educations: {
            create: [
              {
                institution: 'Mukesh Patel School of Technology Management & Engineering (MPSTME, SVKM)',
                degree: 'B.Tech in Computer Engineering',
                fieldOfStudy: 'Computer Science & Engineering',
                startYear: 2022,
                endYear: 2026,
                grade: 'CGPA: 9.2/10',
                activities: 'Lead @ Google Developer Student Club MPSTME, Core Team @ ACM Student Chapter',
                description: 'Specialization in Data Structures, Database Systems, and Cloud Architectures.',
              },
            ],
          },
          experiences: {
            create: [
              {
                companyName: 'DJ Sanghvi Innovation Labs',
                position: 'Software Engineering Intern',
                employmentType: EmploymentType.INTERNSHIP,
                location: 'Vile Parle, Mumbai',
                locationType: LocationType.ON_SITE,
                startDate: new Date('2025-06-01'),
                endDate: new Date('2025-08-31'),
                isCurrent: false,
                description: 'Built high-throughput student verification APIs with NestJS and Redis.',
                skills: ['NestJS', 'PostgreSQL', 'Redis', 'TypeScript'],
              },
            ],
          },
          projects: {
            create: [
              {
                name: 'ConnectSphere — SVKM Professional Network',
                description: 'Full-stack professional networking platform tailored for SVKM students, alumni, faculty, and recruiters. Uses Next.js, NestJS, and Python intelligence algorithms.',
                technologies: ['Next.js', 'NestJS', 'Prisma', 'PostgreSQL', 'Redis', 'Python'],
                startDate: new Date('2025-12-01'),
                isCurrent: true,
              },
            ],
          },
        },
      },
      privacySettings: { create: {} },
    },
  });

  // 4. User 2: SVKM Alumna (DJSCE)
  const alumniUser = await prisma.user.create({
    data: {
      email: 'ananya.deshmukh@alumni.svkm.ac.in',
      username: 'ananyadeshmukh',
      firstName: 'Ananya',
      lastName: 'Deshmukh',
      passwordHash,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          headline: 'Software Engineer @ Microsoft India | DJSCE Alumna (Class of 2023) | SVKM Mentor',
          bio: 'DJSCE Computer Engineering graduate. Currently building cloud microservices at Microsoft. Happy to give resume reviews, mock interviews, and referral guidance for SVKM juniors!',
          location: 'Mumbai, Maharashtra',
          isOpenToWork: false,
          educations: {
            create: [
              {
                institution: 'Dwarkadas J. Sanghvi College of Engineering (DJSCE, SVKM)',
                degree: 'B.E. in Computer Engineering',
                fieldOfStudy: 'Computer Engineering',
                startYear: 2019,
                endYear: 2023,
                grade: 'First Class with Distinction',
                activities: 'Head of Technical Committee @ DJ CSI, Lead Organizer @ DJ Strike Hackathon',
              },
            ],
          },
          experiences: {
            create: [
              {
                companyName: 'Microsoft India',
                position: 'Software Engineer II',
                employmentType: EmploymentType.FULL_TIME,
                location: 'Mumbai, India',
                locationType: LocationType.HYBRID,
                startDate: new Date('2023-08-01'),
                isCurrent: true,
                description: 'Developing Azure-native distributed services, optimizing data pipelines handling millions of daily events.',
                skills: ['TypeScript', 'C++', 'System Design', 'Cloud Computing'],
              },
            ],
          },
        },
      },
      privacySettings: { create: {} },
    },
  });

  // 5. User 3: SVKM Faculty (NMIMS MPSTME)
  const facultyUser = await prisma.user.create({
    data: {
      email: 'dr.kavita.patil@svkm.ac.in',
      username: 'drkavitapatil',
      firstName: 'Dr. Kavita',
      lastName: 'Patil',
      passwordHash,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          headline: 'Associate Professor & Faculty Placement Head @ MPSTME, NMIMS | AI & Algorithms',
          bio: 'Teaching Advanced Data Structures & Algorithms, Machine Learning, and supervising Capstone projects across SVKM institutions. Faculty coordinator for Industry Partnerships and Placements.',
          location: 'Vile Parle, Mumbai',
          educations: {
            create: [
              {
                institution: 'Narsee Monjee Institute of Management Studies (NMIMS Deemed University)',
                degree: 'Ph.D. in Computer Science',
                fieldOfStudy: 'Algorithms & AI',
                startYear: 2014,
                endYear: 2019,
              },
            ],
          },
          experiences: {
            create: [
              {
                companyName: 'Mukesh Patel School of Technology Management & Engineering (MPSTME)',
                position: 'Associate Professor & Faculty Placement Coordinator',
                employmentType: EmploymentType.FULL_TIME,
                location: 'Mumbai, India',
                locationType: LocationType.ON_SITE,
                startDate: new Date('2019-07-01'),
                isCurrent: true,
                description: 'Facilitating student-industry connects, mentoring research publications, and designing modern industry curricula.',
                skills: ['Data Structures & Algorithms', 'Machine Learning', 'Python'],
              },
            ],
          },
        },
      },
      privacySettings: { create: {} },
    },
  });

  // 6. User 4: Campus Recruiter
  const recruiterUser = await prisma.user.create({
    data: {
      email: 'vikram.shah@talent.tcs.com',
      username: 'vikramshah',
      firstName: 'Vikram',
      lastName: 'Shah',
      passwordHash,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          headline: 'Campus Talent Acquisition Lead @ TCS | Hiring SVKM Engineering & Tech Graduates',
          bio: 'Partnering with SVKM placement teams across MPSTME, DJSCE, and NMIMS for Digital and Innovator engineering campus cohorts.',
          location: 'Mumbai, Maharashtra',
          isOpenToWork: false,
          experiences: {
            create: [
              {
                companyName: 'Tata Consultancy Services',
                position: 'Lead Campus Recruiter',
                employmentType: EmploymentType.FULL_TIME,
                location: 'Mumbai, India',
                locationType: LocationType.HYBRID,
                startDate: new Date('2021-01-15'),
                isCurrent: true,
                description: 'Overseeing campus drives and technical interview rounds for premier engineering institutes in Mumbai.',
                skills: ['Talent Acquisition', 'Campus Placements'],
              },
            ],
          },
        },
      },
      privacySettings: { create: {} },
    },
  });

  // Attach skills
  await prisma.userSkill.createMany({
    data: [
      { userId: studentUser.id, skillId: skillsMap['Data Structures & Algorithms'] },
      { userId: studentUser.id, skillId: skillsMap['TypeScript'] },
      { userId: studentUser.id, skillId: skillsMap['NestJS'] },
      { userId: studentUser.id, skillId: skillsMap['Next.js'] },
      { userId: studentUser.id, skillId: skillsMap['PostgreSQL'] },
      { userId: studentUser.id, skillId: skillsMap['Redis'] },
      { userId: alumniUser.id, skillId: skillsMap['System Design'] },
      { userId: alumniUser.id, skillId: skillsMap['TypeScript'] },
      { userId: alumniUser.id, skillId: skillsMap['Cloud Computing'] },
      { userId: facultyUser.id, skillId: skillsMap['Data Structures & Algorithms'] },
      { userId: facultyUser.id, skillId: skillsMap['Python'] },
      { userId: facultyUser.id, skillId: skillsMap['Machine Learning'] },
    ],
  });

  // 7. Create Companies / Organizations in SVKM Ecosystem
  const placementCell = await prisma.company.create({
    data: {
      name: 'SVKM Central Placement & Training Cell',
      slug: 'svkm-placement-cell',
      description: 'The official Career and Placement Cell facilitating campus recruitment, summer internships, and industry interaction for all SVKM institutions including MPSTME, DJSCE, NMIMS, Mithibai, and NM College.',
      industry: 'Higher Education & Career Placements',
      companySize: 'SIZE_51_200',
      location: 'Vile Parle West, Mumbai',
      website: 'https://svkm.ac.in/placements',
      isVerified: true,
      createdById: admin.id,
      members: {
        create: [
          { userId: admin.id, role: CompanyMemberRole.ADMIN },
          { userId: facultyUser.id, role: CompanyMemberRole.MEMBER },
        ],
      },
    },
  });

  const djLabs = await prisma.company.create({
    data: {
      name: 'DJ Sanghvi Innovation & Research Labs',
      slug: 'djsce-innovation-labs',
      description: 'Student-led incubation and engineering research centre at Dwarkadas J. Sanghvi College of Engineering, driving hackathons, IoT labs, and deep-tech prototypes.',
      industry: 'Research & Innovation',
      companySize: 'SIZE_11_50',
      location: 'Vile Parle, Mumbai',
      website: 'https://djsce.ac.in',
      isVerified: true,
      createdById: alumniUser.id,
      members: {
        create: [
          { userId: alumniUser.id, role: CompanyMemberRole.ADMIN },
        ],
      },
    },
  });

  const tcsCompany = await prisma.company.create({
    data: {
      name: 'Tata Consultancy Services (SVKM Campus Partner)',
      slug: 'tcs-svkm-campus-partner',
      description: 'Global IT and consulting enterprise offering Digital and Prime campus engineering roles to top SVKM graduates.',
      industry: 'Information Technology & Services',
      companySize: 'SIZE_5001_PLUS',
      location: 'Mumbai, India',
      website: 'https://tcs.com',
      isVerified: true,
      createdById: recruiterUser.id,
      members: {
        create: [
          { userId: recruiterUser.id, role: CompanyMemberRole.RECRUITER },
        ],
      },
    },
  });

  // 8. Create SVKM Campus Jobs & Internships
  await prisma.job.create({
    data: {
      companyId: tcsCompany.id,
      postedById: recruiterUser.id,
      title: 'Graduate Software Engineer — 2026 SVKM Campus Drive',
      description: 'Exclusive campus recruitment drive for final year B.Tech/B.E. students of MPSTME and DJSCE. Seeking talented programmers with strong problem-solving foundations in Data Structures and Algorithms.',
      responsibilities: 'Build scalable enterprise microservices, implement secure APIs, write unit tests, and collaborate with agile cross-functional engineering teams.',
      requirements: 'Students from MPSTME / DJSCE graduating in 2026. Proficient in one core language (Java, C++, TypeScript, or Python). Solid grasp of DSA, DBMS, and Object-Oriented Design.',
      benefits: 'Competitive campus package (INR 7.5 LPA - 12 LPA), joining bonus, health insurance, hybrid work model, and continuous learning certifications.',
      location: 'Mumbai (Hybrid)',
      locationType: LocationType.HYBRID,
      employmentType: EmploymentType.FULL_TIME,
      experienceLevel: ExperienceLevel.ENTRY,
      salaryMin: 750000,
      salaryMax: 1200000,
      salaryCurrency: 'INR',
      status: JobStatus.OPEN,
      skills: {
        create: [
          { skillId: skillsMap['Data Structures & Algorithms'] },
          { skillId: skillsMap['Java'] },
          { skillId: skillsMap['TypeScript'] },
        ],
      },
    },
  });

  await prisma.job.create({
    data: {
      companyId: djLabs.id,
      postedById: alumniUser.id,
      title: 'Full-Stack Web Engineering Intern (Next.js & NestJS)',
      description: 'Summer research and development internship for SVKM students. Work directly on open-source college portals, attendance engines, and high-performance WebSockets.',
      responsibilities: 'Develop frontend user interfaces in Next.js 14, implement RESTful backend endpoints in NestJS, and optimize Redis cache layers.',
      requirements: 'Open to 2nd, 3rd, and 4th-year SVKM students (MPSTME, DJSCE, Mithibai). Hands-on familiarity with React, Node.js, and SQL.',
      benefits: 'Monthly stipend (INR 25,000/month), project certificate signed by faculty leads, letter of recommendation, and fast-track campus placement nomination.',
      location: 'Vile Parle, Mumbai',
      locationType: LocationType.ON_SITE,
      employmentType: EmploymentType.INTERNSHIP,
      experienceLevel: ExperienceLevel.ENTRY,
      salaryMin: 25000,
      salaryMax: 40000,
      salaryCurrency: 'INR',
      status: JobStatus.OPEN,
      skills: {
        create: [
          { skillId: skillsMap['Next.js'] },
          { skillId: skillsMap['NestJS'] },
          { skillId: skillsMap['TypeScript'] },
          { skillId: skillsMap['PostgreSQL'] },
        ],
      },
    },
  });

  // 9. Create Connections
  await prisma.connection.create({
    data: {
      requesterId: studentUser.id,
      addresseeId: alumniUser.id,
      status: ConnectionStatus.ACCEPTED,
    },
  });

  await prisma.connection.create({
    data: {
      requesterId: facultyUser.id,
      addresseeId: studentUser.id,
      status: ConnectionStatus.ACCEPTED,
    },
  });

  await prisma.connection.create({
    data: {
      requesterId: recruiterUser.id,
      addresseeId: studentUser.id,
      status: ConnectionStatus.PENDING,
      message: 'Hello Rohan, impressed by your MPSTME project portfolio. Would love to connect regarding our upcoming campus interview cohort!',
    },
  });

  // 10. Create SVKM Community Posts
  const post1 = await prisma.post.create({
    data: {
      authorId: studentUser.id,
      type: PostType.TEXT,
      content: '🎓 Proud to share our DSA Capstone project: ConnectSphere — SVKM\'s very own professional networking platform!\n\nDesigned exclusively for students, alumni, faculty, and recruiters across NMIMS, MPSTME, DJSCE, Mithibai, and NM College. We integrated NestJS WebSockets for real-time messaging, Redis for instant caching, PostgreSQL with Prisma for clean data models, and a Python FastAPI intelligence service for algorithmic feed ranking.\n\nEverything is 100% free for the SVKM community! Looking forward to your feedback.\n\n#SVKM #MPSTME #ConnectSphere #DataStructures #NextJS #NestJS #SoftwareEngineering',
      visibility: PostVisibility.PUBLIC,
      likeCount: 42,
      commentCount: 3,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      authorId: alumniUser.id,
      type: PostType.TEXT,
      content: '💡 Hey SVKM juniors! As placement season kicks into high gear across MPSTME and DJSCE, remember that mastering Data Structures & Algorithms (Trees, Graphs, Dynamic Programming) alongside clean System Design fundamentals is the biggest differentiator in tech interviews.\n\nI am offering 30-minute resume reviews and mock interviews this weekend for SVKM students. Drop a comment below or send a connection request!\n\n#DJSCE #MPSTME #SVKMAlumni #CampusPlacements #TechCareers #DSA',
      visibility: PostVisibility.PUBLIC,
      likeCount: 68,
      commentCount: 5,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      authorId: facultyUser.id,
      type: PostType.TEXT,
      content: '📢 Announcement from the SVKM Central Placement Cell:\n\nRegistration for the 2026 Campus Recruitment Drive is now open on ConnectSphere. Companies including TCS, Microsoft, Morgan Stanley, and Deloitte will be conducting on-campus coding assessments next month.\n\nAll eligible students from MPSTME and DJSCE must ensure their profiles, project repositories, and technical skills are completely updated.\n\n#SVKMPlacements #NMIMS #MPSTME #DJSCE #CampusDrive2026',
      visibility: PostVisibility.PUBLIC,
      likeCount: 89,
      commentCount: 8,
    },
  });

  // Comments
  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: alumniUser.id,
      content: 'Fantastic work Rohan! Great to see students from MPSTME building real-world distributed architectures. Happy to connect!',
    },
  });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: facultyUser.id,
      content: 'Excellent project demonstration Rohan. This is a model implementation of full-stack engineering with scalable microservices.',
    },
  });

  console.log('✅ SVKM Database seeded successfully!');
  console.log('   Admin: admin@svkm.ac.in (Admin@123)');
  console.log('   Student: rohanmehta (Password@123)');
  console.log('   Alumna: ananyadeshmukh (Password@123)');
  console.log('   Faculty: drkavitapatil (Password@123)');
  console.log('   Recruiter: vikramshah (Password@123)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
