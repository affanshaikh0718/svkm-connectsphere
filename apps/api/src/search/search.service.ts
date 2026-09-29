import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string) {
    if (!query || query.trim().length === 0) {
      return {
        users: [],
        people: [],
        companies: [],
        jobs: [],
        posts: [],
        totalUsers: 0,
        totalCompanies: 0,
        totalJobs: 0,
        totalPosts: 0,
      };
    }

    const cleanQuery = query.trim();
    const tokens = cleanQuery.split(/\s+/).filter(Boolean);

    // Build comprehensive user search conditions for name, title, and tags/skills
    const userOrConditions: any[] = [
      { firstName: { contains: cleanQuery, mode: 'insensitive' } },
      { lastName: { contains: cleanQuery, mode: 'insensitive' } },
      { username: { contains: cleanQuery, mode: 'insensitive' } },
      { profile: { headline: { contains: cleanQuery, mode: 'insensitive' } } },
      {
        profile: {
          experiences: {
            some: {
              position: { contains: cleanQuery, mode: 'insensitive' },
            },
          },
        },
      },
      {
        profile: {
          skills: {
            some: {
              OR: [
                { skill: { name: { contains: cleanQuery, mode: 'insensitive' } } },
                { customName: { contains: cleanQuery, mode: 'insensitive' } },
              ],
            },
          },
        },
      },
    ];

    if (tokens.length >= 2) {
      userOrConditions.push({
        AND: [
          { firstName: { contains: tokens[0], mode: 'insensitive' } },
          { lastName: { contains: tokens.slice(1).join(' '), mode: 'insensitive' } },
        ],
      });
    }

    for (const token of tokens) {
      if (token.length >= 2) {
        userOrConditions.push(
          { profile: { headline: { contains: token, mode: 'insensitive' } } },
          {
            profile: {
              experiences: {
                some: {
                  position: { contains: token, mode: 'insensitive' },
                },
              },
            },
          },
          {
            profile: {
              skills: {
                some: {
                  OR: [
                    { skill: { name: { contains: token, mode: 'insensitive' } } },
                    { customName: { contains: token, mode: 'insensitive' } },
                  ],
                },
              },
            },
          },
        );
      }
    }

    const [people, companies, jobs, posts] = await Promise.all([
      // Search People by Name, Title, and Tags/Skills
      this.prisma.user.findMany({
        where: {
          status: 'ACTIVE',
          OR: userOrConditions,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          profile: {
            select: {
              headline: true,
              profilePictureUrl: true,
              location: true,
              skills: {
                take: 3,
                include: { skill: true },
              },
            },
          },
        },
        take: 8,
      }),

      // Search Companies
      this.prisma.company.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { name: { contains: cleanQuery, mode: 'insensitive' } },
            { industry: { contains: cleanQuery, mode: 'insensitive' } },
            { location: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          industry: true,
          location: true,
          logoUrl: true,
        },
        take: 6,
      }),

      // Search Jobs
      this.prisma.job.findMany({
        where: {
          status: 'OPEN',
          OR: [
            { title: { contains: cleanQuery, mode: 'insensitive' } },
            { location: { contains: cleanQuery, mode: 'insensitive' } },
            { company: { name: { contains: cleanQuery, mode: 'insensitive' } } },
          ],
        },
        include: {
          company: {
            select: { name: true, slug: true, logoUrl: true },
          },
        },
        take: 6,
      }),

      // Search Posts
      this.prisma.post.findMany({
        where: {
          isDeleted: false,
          visibility: 'PUBLIC',
          content: { contains: cleanQuery, mode: 'insensitive' },
        },
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true,
              username: true,
              profile: { select: { profilePictureUrl: true } },
            },
          },
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      users: people,
      people,
      companies,
      jobs,
      posts,
      totalUsers: people.length,
      totalCompanies: companies.length,
      totalJobs: jobs.length,
      totalPosts: posts.length,
    };
  }
}
