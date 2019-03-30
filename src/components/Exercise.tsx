import React, { BaseSyntheticEvent, Component } from 'react';
import { Link, match } from 'react-router-dom';
import hash from 'object-hash';
import { connect } from 'react-redux';
import { ExerciseItem, ExercisesState } from '../store/reducers/exercisesReducer';
import { setTypedText } from '../store/actions/exercisesActions';
import Line from './Line';

interface RouterParams {
  id: string;
}

interface RouterProps {
  match: match<RouterParams>;
}

interface StateProps {
  exercisesState: ExercisesState;
}

interface MappedProps {
  exercise: ExerciseItem;
  textTypedByUser: string;
}

interface DispatchProps {
  setTypedText: (text: string) => void;
}

type ComProps = RouterProps & MappedProps & DispatchProps;

class Exercise extends Component<ComProps> {
  public constructor(props: ComProps) {
    super(props);
    this.inputRef = React.createRef();
  }

  public componentDidMount(): void {
    this.refocusMainInput();
  }

  private refocusMainInput = (): void => {
    const refInput = this.inputRef.current;

    if (refInput) {
      refInput.focus();
    }
  };

  private splitTextToLines = (): string[] => {
    const re = /[\w\W]{1,55}[.!?\s]/g;
    return this.props.exercise.text.match(re) || [];
  };

  private renderLines = (): React.ReactElement[] => {
    const exercise = { id: 0, title: 'Foo', text: 'Bar' };
    let totalLength = 0;

    return this.splitTextToLines().map((line, ind) => {
      const key = hash(`${exercise.id}${ind}${line}`);
      const typedLineText = this.props.textTypedByUser.slice(
        totalLength,
        totalLength + line.length,
      );
      totalLength += line.length;

      return (
        <Line
          key={key}
          lineKey={key}
          lineText={line}
          typedLineText={typedLineText}
          exerciseTextLength={this.props.exercise.text.length}
          typedTextLength={this.props.textTypedByUser.length}
        />
      );
    });
  };

  private handleOnChange = (e: BaseSyntheticEvent): void => {
    const textTypedByUser = e.currentTarget.value;

    // this.setState(() => ({ typedText }));
    this.props.setTypedText(textTypedByUser);
  };

  private readonly inputRef: React.RefObject<HTMLInputElement>;

  public render(): React.ReactElement {
    const { title } = this.props.exercise;
    const { textTypedByUser } = this.props;

    return (
      <section>
        <h2>{title}</h2>
        <input
          ref={this.inputRef}
          type="text"
          value={textTypedByUser}
          onChange={this.handleOnChange}
          onBlur={this.refocusMainInput}
        />

        <p>{textTypedByUser || '-'}</p>
        <hr />
        <article>{this.renderLines()}</article>

        <section />

        <Link to="/">Go Back</Link>
      </section>
    );
  }
}

function mapStateToProps(state: StateProps, comProps: ComProps): MappedProps {
  let exercise = state.exercisesState.exercises.find(
    (e: ExerciseItem) => `${e.id}` === comProps.match.params.id,
  );
  if (!exercise) {
    exercise = { id: -1, title: 'Exercise Not found', text: 'None' };
  }

  return {
    exercise,
    textTypedByUser: state.exercisesState.textTypedByUser,
  };
}

export default connect(
  mapStateToProps,
  { setTypedText },
)(Exercise);
