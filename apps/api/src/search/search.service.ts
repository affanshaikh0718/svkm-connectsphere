import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string) {
    if (!query || query.trim().length === 0) {
      return { people: [], companies: [], jobs: [], posts: [] };
    }

    const cleanQuery = query.trim();

    const [people, companies, jobs, posts] = await Promise.all([
      // Search People
      this.prisma.user.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { firstName: { contains: cleanQuery, mode: 'insensitive' } },
            { lastName: { contains: cleanQuery, mode: 'insensitive' } },
            { username: { contains: cleanQuery, mode: 'insensitive' } },
            { profile: { headline: { contains: cleanQuery, mode: 'insensitive' } } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          profile: { select: { headline: true, profilePictureUrl: true, location: true } },
        },
        take: 5,
      }),

      // Search Companies
      this.prisma.company.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { name: { contains: cleanQuery, mode: 'insensitive' } },
            { industry: { contains: cleanQuery, mode: 'insensitive' } },
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
        take: 5,
      }),

      // Search Jobs
      this.prisma.job.findMany({
        where: {
          status: 'OPEN',
          OR: [
            { title: { contains: cleanQuery, mode: 'insensitive' } },
            { location: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        include: {
          company: {
            select: { name: true, slug: true, logoUrl: true },
          },
        },
        take: 5,
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
      people,
      companies,
      jobs,
      posts,
    };
  }
}
