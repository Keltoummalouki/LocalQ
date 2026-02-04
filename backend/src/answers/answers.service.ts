import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Answer, AnswerDocument } from './schemas/answer.schema';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common'; 

@Injectable()
export class AnswersService {
  constructor(@InjectModel(Answer.name) private answerModel: Model<AnswerDocument>) {}

  async create(createAnswerDto: CreateAnswerDto, authorId: string) {
    const newAnswer = new this.answerModel({
      content: createAnswerDto.content,
      question: new Types.ObjectId(createAnswerDto.questionId),
      author: new Types.ObjectId(authorId),
    });
    return newAnswer.save();
  }

  async findByQuestion(questionId: string) {
    return this.answerModel.find({ 
      question: new Types.ObjectId(questionId) 
    } as any) 
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  // Récupérer les réponses d'un auteur (avec le titre de la question associée)
  async findByAuthor(authorId: string) {
    return this.answerModel.find({ 
      author: new Types.ObjectId(authorId) // Conversion en ObjectId
      } as any) 
      .populate('question', 'title')
      .sort({ createdAt: -1 })
      .exec();
  }

  async remove(id: string, userId: string) {
    const answer = await this.answerModel.findById(id);

    if (!answer) {
      throw new NotFoundException('Réponse introuvable');
    }

    if (answer.author.toString() !== userId) {
      throw new UnauthorizedException('Action non autorisée');
    }

    return this.answerModel.findByIdAndDelete(id);
  }

  async toggleVote(id: string, userId: string) {
    const answer = await this.answerModel.findById(id);
    if (!answer) throw new NotFoundException('Réponse introuvable');

    const userIdObj = new Types.ObjectId(userId);
    const isVoted = answer.upvotes.some((user) => user.toString() === userId);

    if (isVoted) {
      answer.upvotes = answer.upvotes.filter((user) => user.toString() !== userId);
    } else {
      answer.upvotes.push(userIdObj as any);
    }

    return answer.save();
  }
}