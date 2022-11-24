/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';

import { Column } from '../Column/Column';

import { columnsApi } from '@/api/services/ColumnsService';
import { IColumn } from '@/app/types';
import { Loader } from '@/components/Loader/Loader';
import './ColumnsContainer.pcss';

interface ColumnsContainerProps {
  boardId: string;
}

export const ColumnsContainer = ({ boardId }: ColumnsContainerProps): JSX.Element => {

  const { data: columns, isLoading } = columnsApi.useGetColumnsQuery(boardId);
  const [createCol, { error, isLoading: crLoading }] = columnsApi.useCreateColumnMutation();
  const [deleteCol, { isLoading: delLoading }] = columnsApi.useDeleteColumnMutation();
  const [updateColOrder] = columnsApi.useUpdateColumnSetMutation();

  const { t } = useTranslation();

  const handleCreate = async () => {
    // eslint-disable-next-line no-alert
    const title = prompt('Input new column title');

    const getBiggestOrder = (cols: IColumn[] | undefined) =>
      (cols && cols.length > 0)
        ? [...cols].sort((a, b)=>(a.order - b.order))[cols.length-1].order
        : 0;

    if (title){
      await createCol({
        col: {
          title,
          order: getBiggestOrder(columns) + 1,
        } as IColumn,
        boardId,
      });
    }
  };

  const handleDragEnd = async () => {
    // ToDo
  };

  const handleDelete = async (col: IColumn) => {
    await deleteCol({
      col,
      boardId,
    });
  };

  const handleShuffle = async () => {
    if (columns) {
      await updateColOrder([...columns]
        .sort((a, b)=>(a.order - b.order))
        .map((el, i )=>({
          _id: el.id,
          order: columns.length - i,
        })),
      );
    }

  };

  return (
    <section className="columns">
      {error && (
        <p> {`${JSON.stringify(error)}`}</p>
      )}

      {((isLoading || delLoading || crLoading) && <Loader/> )}

      <DragDropContext
        onDragEnd={handleDragEnd} >
        <Droppable droppableId={boardId}>
          {provided => (
            <div className="columns-wrapper"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >

              {columns && [...columns]
                .sort((a, b) => (a.order - b.order))
                .map((col, i) =>
                  <Column
                    column={col}
                    boardId={boardId}
                    onDelete={handleDelete}
                    key={col.id}
                    index={i}
                  />,
                )}

              {provided.placeholder}

              <div className="columns-add">
                <button
                  type='button'
                  className='columns-add-bttn'
                  onClick={handleCreate}
                >
                  {t('TASKS.ADD_COL')}
                </button>

                <button
                  type='button'
                  className='columns-add-bttn'
                  onClick={handleShuffle}
                >
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path fillRule="evenodd" d="M15.97 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H7.5a.75.75 0 010-1.5h11.69l-3.22-3.22a.75.75 0 010-1.06zm-7.94 9a.75.75 0 010 1.06l-3.22 3.22H16.5a.75.75 0 010 1.5H4.81l3.22 3.22a.75.75 0 11-1.06 1.06l-4.5-4.5a.75.75 0 010-1.06l4.5-4.5a.75.75 0 011.06 0z" clipRule="evenodd" />
                    </svg>
                  </span>

                  <span>{t('TASKS.REVERSE')}</span>
                </button>
              </div>

            </div>
          )}
        </Droppable>
      </DragDropContext>
    </section>
  );
};
