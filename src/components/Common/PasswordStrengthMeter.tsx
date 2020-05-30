import React from 'react';
import zxcvbn from 'zxcvbn';
import classNames from 'classnames';

export type Props = {
  password: string;
  caption?: string;
};

declare type State = {
  score: zxcvbn.ZXCVBNScore;
};

const scoreToStr = (score: zxcvbn.ZXCVBNScore): string => {
  let res: string;

  switch (score) {
    case 0:
      res = 'Очень низкая';
      break;
    case 1:
      res = 'Низкая';
      break;
    case 2:
      res = 'Средняя';
      break;
    case 3:
      res = 'Хорошая';
      break;
    case 4:
      res = 'Отличная';
      break;
  }

  return res;
};

export class PasswordStrengthMeter extends React.Component<Props, State> {
  state: State = {
    score: 0,
  };

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>,
    snapshot?: any,
  ) {
    if (this.props.password !== prevProps.password) {
      const { score } = zxcvbn(this.props.password);
      this.setState({ score });
    }
  }

  render() {
    const { score } = this.state;

    return (
      <div className="is-size-7">
        <strong className="has-text-grey">
          {this.props.caption || 'Надёжность пароля'}:
        </strong>{' '}
        <strong
          className={classNames({
            // 'has-text-danger': score < 2,
            // 'has-text-warning': score === 2,
            'has-text-warning': score <= 2,
            'has-text-success': score > 2,
          })}
        >
          {scoreToStr(score)}
        </strong>
      </div>
    );
  }
}

// export const PasswordStrengthMeter: React.FC<{
//   password: string;
//   onChange?: (strength: number) => void;
// }> = ({ password, onChange }) => {
//   return (
//     <div className="is-size-7">
//       <strong className="has-text-grey">Надёжность пароля:</strong> ну такое
//     </div>
//   );
//
//   // return (
//   //   <progress className="progress is-small" value="15" max="100">
//   //     15%
//   //   </progress>
//   // );
// };

// export type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>;
//
// export const PasswordInput: React.FC<PasswordInputProps> = ({
//   value,
//   ...props
// }) => {
//   const [pswVisible, setPswVisible] = React.useState<boolean>(false);
//
//   return <input type={pswVisible ? 'password' : 'text'} {...props} />;
// };
