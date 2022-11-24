import { Draggable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';

import { Task } from '../Task/Task';

import { tasksApi } from '@/api/services/TasksService';
import { IColumn, ITask } from '@/app/types';
import { Loader } from '@/components/Loader/Loader';
import './Column.pcss';

interface ColumnProps {
  column: IColumn;
  boardId: string;
  onDelete: (col: IColumn) => void;
  index: number;
}
export const Column = ({ boardId, column, onDelete, index }: ColumnProps): JSX.Element => {

  const { data: tasks, isLoading } =
    tasksApi.useGetTasksQuery({ boardId, colId: column.id });

  const [createTask, { isLoading: crLoading }] = tasksApi.useCreateTaskMutation();
  const [deleteTask, { isLoading: delLoading }] = tasksApi.useDeleteTaskMutation();

  const { t } = useTranslation();

  const handleDeleteTask = async (task: ITask) => {
    await deleteTask({ task, boardId, colId: column.id });
  };

  const handleCreateTask = async () => {
    // eslint-disable-next-line no-alert
    const taskTitle = prompt('Input new task title');

    if (taskTitle) {
      await createTask({
        colId: column.id,
        boardId,
        task: {
          title: taskTitle,
          order: 0,
          description: 'string',
          userId: 0,
          users: [
            'string',
          ],
        } as ITask,
      });
    }

  };

  return (
    <Draggable draggableId={column.id} index={index}>
      {provided => (
        <section className="column-wrapper"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          {((isLoading || crLoading || delLoading) && <Loader />)}

          <div className="column">
            <h1 className="column-title">{column.title} (order: {column.order})</h1>

            <button
              type='button'
              className="column-del"
              onClick={() => onDelete(column)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="board-del-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>

            <div className="column-body" >
              {tasks && tasks.map(task =>
                <Task
                  task={task}
                  //   boardId = {boardId}
                  //   colId = {column.id}
                  onDelete={handleDeleteTask}
                  key={task.id}
                />,
              )}
            </div>
            <div className="column-buttons col-bttn" >
              <button
                type='button'
                className="column-bttn"
                onClick={handleCreateTask}
              >
                {t('TASKS.ADD')}
              </button>
              <button
                type='button'
                className="column-bttn"
                onClick={() => onDelete(column)}
              >
                {t('TASKS.DEL')}
              </button>
            </div>
          </div>
        </section>
      )}
    </Draggable>
  );
};
