/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import path from 'path';
import fs from 'fs';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import AppError from '../errors/AppError';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  fileName: string;
}

class ImportTransactionsService {
  private transactions: Transaction[] = [];

  async execute({ fileName }: Request): Promise<Transaction[]> {
    const pathFile = path.join(uploadConfig.directory, fileName);

    const pathExists = await fs.promises.stat(pathFile);
    if (!pathExists) {
      throw new AppError('Arquivo não encontrado!', 404);
    }

    const file = fs.readFileSync(pathFile, 'utf8');

    const fileSplit = file.split('\n');
    const createTransactionService = new CreateTransactionService();

    let isFirst = true;

    for (const fileCsv of fileSplit) {
      if (isFirst) {
        isFirst = false;
        continue;
      }
      const col = fileCsv.split(',');

      if (col.length === 4) {
        const title = col[0];
        const type = col[1];
        const valstring = col[2];
        const value = Number(valstring.trim());
        const category = col[3];
        const transaction = await createTransactionService.execute({
          title: title.trim(),
          value,
          type: type.trim() === 'income' ? 'income' : 'outcome',
          category: category.trim(),
        });

        this.transactions.push(transaction);
      }
    }

    return this.transactions;
  }
}

export default ImportTransactionsService;
