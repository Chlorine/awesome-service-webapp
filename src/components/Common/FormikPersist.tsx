// https://github.com/jaredpalmer/formik-persist

import * as React from 'react';
import { FormikProps, connect } from 'formik';
import { debounce } from 'lodash';
import isEqual from 'react-fast-compare';

import { Utils } from '../../utils/utils';

export interface PersistProps {
  formName: string;
  debounce?: number;
  onBeforeSave?: (data: any) => any;
  onBeforeLoad?: (data: any) => any;
}

class PersistImpl extends React.Component<
  PersistProps & { formik: FormikProps<any> },
  {}
> {
  static defaultProps = {
    debounce: 300,
  };

  saveForm = debounce((data: FormikProps<{}>) => {
    let formValues = this.props.onBeforeSave
      ? this.props.onBeforeSave(data.values)
      : data.values;

    // console.log(
    //   `FormikPersist.saveForm: formName="${
    //     this.props.formName
    //   }" values=${JSON.stringify(formValues, null, 2)}`,
    // );

    Utils.localStorageSet(this.props.formName, formValues);
  }, this.props.debounce);

  componentDidUpdate(prevProps: PersistProps & { formik: FormikProps<any> }) {
    if (!isEqual(prevProps.formik, this.props.formik)) {
      this.saveForm(this.props.formik);
    }
  }

  componentDidMount() {
    let maybeValues = Utils.localStorageGet(this.props.formName);

    if (this.props.onBeforeLoad) {
      try {
        maybeValues = this.props.onBeforeLoad(maybeValues);
      } catch (err) {
        maybeValues = null;
      }
    }

    // console.log(
    //   `FormikPersist.cdm: formName="${
    //     this.props.formName
    //   }" values=${JSON.stringify(maybeValues, null, 2)}`,
    // );

    if (maybeValues) {
      this.props.formik.setValues(maybeValues);
    }
  }

  render() {
    return null;
  }
}

export const FormikPersist = connect<PersistProps, any>(PersistImpl);

// // не катит, надо ресетить
// export const clearFormInLocalStorage = (formName: string): void => {
//   console.log(`clearFormInLocalStorage "${formName}"`);
//   Utils.localStorageSet(formName, null);
//   console.log(Utils.localStorageGet(formName));
// };
