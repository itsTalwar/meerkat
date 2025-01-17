import { Member, QueryFilter } from '../../types/cube-types/query';
import { ExpressionType } from '../../types/duckdb-serialization-types/serialization/Expression';
import { isArrayTypeMember } from '../../utils/is-array-member-type';
import { baseDuckdbCondition } from '../base-condition-builder/base-condition-builder';
import { CubeToParseExpressionTransform } from '../factory';
import { orDuckdbCondition } from '../or/or';
import { notEqualsArrayTransform } from './not-equals-array';

export interface NotEqualsFilters extends QueryFilter {
  member: Member;
  operator: 'notEquals';
  values: string[];
}

export const notEqualsTransform: CubeToParseExpressionTransform = (query) => {
  const { member, values } = query;

  if (!values || values.length === 0) {
    throw new Error('Equals filter must have at least one value');
  }

  /**
   * If the member is an array, we need to use the array transform
   */
  if (isArrayTypeMember(query.memberInfo.type)) {
    return notEqualsArrayTransform(query);
  }

  /**
   * If there is only one value, we can create a simple equals condition
   */
  if (values.length === 1) {
    return baseDuckdbCondition(
      member,
      ExpressionType.COMPARE_NOTEQUAL,
      values[0],
      query.memberInfo
    );
  }

  /**
   * If there are multiple values, we need to create an OR condition
   */
  const orCondition = orDuckdbCondition();
  values.forEach((value) => {
    orCondition.children.push(
      baseDuckdbCondition(
        member,
        ExpressionType.COMPARE_NOTEQUAL,
        value,
        query.memberInfo
      )
    );
  });
  return orCondition;
};
