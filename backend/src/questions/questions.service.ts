import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from './schemas/question.schema';
import { CreateQuestionDto } from './dto/create-question.dto';

@Injectable()
export class QuestionsService {
  constructor(@InjectModel(Question.name) private questionModel: Model<QuestionDocument>) {}


  async create(createQuestionDto: CreateQuestionDto) {
    const createdQuestion = new this.questionModel(createQuestionDto);
    return createdQuestion.save();
  }

  async findAll() {
    return this.questionModel.find()
      .populate('author', 'firstName lastName') // On récupère juste le nom de l'auteur, pas son mot de passe
      .sort({ createdAt: -1 }) // Les plus récentes en premier
      .exec();
  }

  async findOne(id: string) {
    return this.questionModel.findById(id).populate('author', 'firstName lastName').exec();
  }

  update(id: number, updateQuestionDto: any) { return `Update #${id}`; }
  remove(id: number) { return `Delete #${id}`; }
}