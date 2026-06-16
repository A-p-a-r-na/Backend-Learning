import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  private profiles = [
    {
      id: randomUUID(),
      name: 'John',
      age: 23,
    },
    {
      id: randomUUID(),
      name: 'Mark',
      age: 27,
    },
    {
      id: randomUUID(),
      name: 'Shomy',
      age: 29,
    },
  ];

  findAll() {
    return this.profiles;
  }

  findOne(id: string) {
    const matchingProfile = this.profiles.find((p) => p.id === id);

    if (!matchingProfile) {
      throw new Error(`Profile with ID ${id} not found  `);
    }
  }

  create(CreateProfileDto: CreateProfileDto) {
    const CreateProfile = {
      id: randomUUID(),
      ...CreateProfileDto,
    };
    this.profiles.push(CreateProfile);
    return CreateProfile;
  }

  update(id: string, UpdateProfileDto: UpdateProfileDto) {
    const matchingProfile = this.profiles.find((p) => p.id === id);
    if (!matchingProfile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
    matchingProfile.name = UpdateProfileDto.name;
    matchingProfile.age = UpdateProfileDto.age;
    return matchingProfile;
  }

  remove(id: string) {
    const matchingProfileIndex = this.profiles.findIndex((p) => p.id === id);
    if (matchingProfileIndex === -1) {
      throw new NotFoundException(`Profile with ID ${id} not found  `);
    } else {
      this.profiles.splice(matchingProfileIndex, 1);
    }
    return matchingProfileIndex;
  }
}
