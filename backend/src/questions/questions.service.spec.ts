import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsService } from './questions.service';
import { getModelToken } from '@nestjs/mongoose';
import { Question } from './schemas/question.schema';

describe('QuestionsService', () => {
  let service: QuestionsService;
  let model: any;

  // Mock d'une question retournée par la BDD
  const mockQuestion = {
    _id: '1',
    title: 'Test Question',
    content: 'Content',
    city: 'Paris',
    author: { firstName: 'Jean' },
  };

  // Mock de la chaîne Mongoose (find -> populate -> sort -> exec)
  const mockQuery = {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([mockQuestion]),
  };

  const mockQuestionModel = {
    find: jest.fn().mockReturnValue(mockQuery),
    findById: jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockQuestion),
      }),
    }),
  };

  class MockModel {
    save: any; 

    constructor(private data: any) {
      this.save = jest.fn().mockResolvedValue(
        Object.assign({}, this.data, { _id: 'new_id' })
      );
    }

    static find = mockQuestionModel.find;
    static findById = mockQuestionModel.findById;
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        {
          provide: getModelToken(Question.name),
          useValue: MockModel, 
        },
      ],
    }).compile();

    service = module.get<QuestionsService>(QuestionsService);
    model = module.get(getModelToken(Question.name));
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('doit retourner un tableau de questions', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockQuestion]);
      expect(MockModel.find).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('doit créer et sauvegarder une question', async () => {
      const dto = { title: 'New', content: 'C', city: 'Lyon', author: '123' };
      
      const result = await service.create(dto);
      
      expect(result).toHaveProperty('_id', 'new_id');
      expect(result.title).toEqual('New');
    });
  });
});