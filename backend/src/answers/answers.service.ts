import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Answer, AnswerDocument } from './schemas/answer.schema';
import { CreateAnswerDto } from './dto/create-answer.dto';

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
}