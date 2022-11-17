/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { useNavigate } from '@tanstack/react-location';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useEffect, useRef } from 'react';

import { SignFormTypes } from './SignFormLabels';

import { Link } from '../Link/Link';

import { saveLocalAuthState } from '@/app/auth';
import { Loader } from '@/components/Loader/Loader';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import './SignForm.pcss';
import { userLogIn, userLogUp } from '@/store/reducers/AuthThunks';

interface SignFormProps {
  type: SignFormTypes;
}

export const SignForm = ({ type }: SignFormProps): JSX.Element => {

  const loginRef = useRef<string>('');
  const passwordRef = useRef<string>('');
  const { t } = useTranslation();

  const { isLoggedIn, user, token, awaiting, userCreated } = useAppSelector(
    state => state.authReducer,
  );
  const dispatch = useAppDispatch();

  const dispathLogIn = async (login:string, password:string)=>{
    await dispatch(userLogIn({ login, password }));
  };

  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data: Record<string, string>) => {
    const { login, password, name } = data;

    if (type === 'SIGN_IN') {
      dispathLogIn(login, password).catch(()=>{});

    } else if (type === 'SIGN_UP'){
      [loginRef.current, passwordRef.current] = [login, password];
      await dispatch(userLogUp({ login, password, name }));
    }

  };

  useEffect(() => {
    if(userCreated){
      dispathLogIn(loginRef.current, passwordRef.current).catch(()=>{});
    }
  }, [userCreated]);

  useEffect(() => {
    if(isLoggedIn){
      saveLocalAuthState({ isLoggedIn, user, token });
      navigate({ to: '/main' });
    }
  }, [isLoggedIn]);

  return (
    <>
      {(awaiting && <Loader/> )}

      <div className='signform-wrapper'>
        <form className="signform" onSubmit={(handleSubmit(onSubmit))}>

          <div className="signform-item">
            <h2 className="signform-header">{t(`${type}.HEADING`)}</h2>
          </div>

          <div className="signform-item">

            <input
              placeholder={t(`${type}.LOGIN`) as string}
              className='signform-input'
              {...register('login', { required: true })}
              aria-invalid={errors.login ? 'true' : 'false'}
              type="text"
            />

            <div className="error-field">
              {errors.login?.type === 'required' && (
                <span role="alert">{t('SIGN_UP.ENTER_LOGIN')}</span>
              )}
            </div>
          </div>

          {type === 'SIGN_UP' && (
            <div className="signform-item">

              <input
                placeholder={t(`${type}.NAME`) as string}
                className='signform-input'
                {...register('name', { required: true })}
                aria-invalid={errors.name ? 'true' : 'false'}
                type="text"
              />

              <div className="error-field">
                {errors.name?.type === 'required' && (
                  <span role="alert">{t('SIGN_UP.ENTER_NAME')}</span>
                )}
              </div>
            </div>
          )}

          <div className="signform-item">

            <input
              placeholder={t(`${type}.PASSWORD`) as string}
              className='signform-input'
              {...register('password', { required: true })}
              aria-invalid={errors.password ? 'true' : 'false'}
              type="text"
            />

            <div className="error-field">
              {errors.password?.type === 'required' && (
                <span role="alert">{t('SIGN_UP.ENTER_PASSWORD')}</span>
              )}
            </div>
          </div>

          <div className="signform-item">
            <input
              type="submit"
              className='signform-button'
              value={t(`${type}.${type}`) as string}/>
          </div>

          <div className="signform-item">
            <p className="signform-footer">
              {t(`${type}.BOTTOM_TEXT`)}
              <Link
                className='signform-footer-link'
                href={type === 'SIGN_IN' ? '/signin' : '/signup'}
                text={t(`${type}.BOTTOM_LINK`) as string}
              />
            </p>
          </div>
        </form>
      </div>
    </>
  );

};