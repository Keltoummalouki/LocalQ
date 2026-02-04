import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Question, QuestionDocument } from './schemas/question.schema';
import { CreateQuestionDto } from './dto/create-question.dto';


@Injectable()
export class QuestionsService {
  constructor(@InjectModel(Question.name) private questionModel: Model<QuestionDocument>) {}

  async create(createQuestionDto: CreateQuestionDto) {
    const createdQuestion = new this.questionModel(createQuestionDto);
    return createdQuestion.save();
  }

  async findAll(city?: string, search?: string) {
    const filter: any = {};

    // Si une ville est fournie, on filtre
    if (city) {
      filter.city = { $regex: city, $options: 'i' }; 
    }

    // Si une recherche textuelle est fournie, on cherche dans titre OU contenu
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    return this.questionModel.find(filter)
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    return this.questionModel.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } }, 
      { new: true }
    )
    .populate('author', 'firstName lastName')
    .exec();
  }

  async findByAuthor(authorId: string) {
    return this.questionModel.find({ 
      author: new Types.ObjectId(authorId) // 2. Conversion en ObjectId
    } as any) // 3. 'as any' pour forcer TypeScript à accepter le filtre
      .sort({ createdAt: -1 })
      .exec();
  }

  async remove(id: string, userId: string) {
    const question = await this.questionModel.findById(id);
    
    if (!question) {
      throw new NotFoundException('Question introuvable');
    }

    // Seul l'auteur peut supprimer
    if (question.author.toString() !== userId) {
      throw new UnauthorizedException('Vous ne pouvez supprimer que vos propres questions');
    }

    return this.questionModel.findByIdAndDelete(id);
  }

  async toggleVote(id: string, userId: string) {
    const question = await this.questionModel.findById(id);
    if (!question) throw new NotFoundException('Question introuvable');

    const userIdObj = new Types.ObjectId(userId);
    
    // Vérifier si l'user a déjà voté
    const isVoted = question.upvotes.some((user) => user.toString() === userId);

    if (isVoted) {
      // Si oui, on retire le vote (Unlike)
      question.upvotes = question.upvotes.filter((user) => user.toString() !== userId);
    } else {
      // Si non, on ajoute le vote (Like)
      question.upvotes.push(userIdObj as any);
    }

    return question.save();
  }

  async findLikedBy(userId: string) {
  return this.questionModel.find({ 
    upvotes: new Types.ObjectId(userId) 
  } as any)
  .populate('author', 'firstName lastName')
  .sort({ createdAt: -1 })
  .exec();
}
}