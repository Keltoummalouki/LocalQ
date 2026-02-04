import { Injectable, OnModuleInit, Logger } from '@nestjs/common'; // <--- Ajout de OnModuleInit et Logger
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // Methode se lance automatiquement au démarrage du serveur
  async onModuleInit() {
    await this.seedUsers();
  }

  async seedUsers() {
    const usersToCreate = [
      {
        email: 'admin@localq.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'System',
      },
      {
        email: 'patient@localq.com',
        password: 'password123',
        firstName: 'Amine',
        lastName: 'Patient',
      },
    ];

    for (const user of usersToCreate) {
      const exists = await this.findByEmail(user.email);
      if (!exists) {
        await this.create(user as CreateUserDto);
        this.logger.log(`Utilisateur de test créé : ${user.email} (mdp: ${user.password})`);
      } else {
        this.logger.log(`Utilisateur ${user.email} existe déjà.`);
      }
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    let hashedPassword = '';

    // On crypte SEULEMENT si un mot de passe est fourni
    if (createUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    }

    // On crée l'utilisateur (avec ou sans mot de passe haché)
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword, // Sera vide si c'est un Google User
    });

    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}