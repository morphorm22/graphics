"use strict"; 

function getKeys(prefixObject){
  return Object.keys(prefixObject)
}

function getUserGeneratedFieldNames(prefix){
  let functionNames = []
  prefix.forEach(function(prefix_item){
    functionNames.push(getKeys(prefix_item))
  });
  return functionNames   
}

function poissonsRatioCheck(prefix, key){
  if(prefix){
    if(key === 'Poissons Ratio'){
      if(!(prefix[key].value >= 0.0 && prefix[key].value <=0.5)){
        return ['Poissons Ratio must be in range 0.0 - 0.5']
      } else if(!prefix[key].value) {
        return ['Must specify Poissons Ratio']
      }
    }
  }
  return []
}
function loadCheck(prefix, view, fieldSpecifier){
  if(view === "Value"){
    if(prefix['Value'].value == 0){
      return ['Load value in '+fieldSpecifier+' must not be 0']
    }
  } else if (view === "Values"){
    let errors = []
    for (const key in prefix['Values'].value) {
      if(prefix['Values']['value'][key] == 0) {
        errors.push(key+' in '+fieldSpecifier+' must not be 0')
      }
    }
    return errors
  }
  return []
}
    
function isLoadZero(prefix, fieldSpecifier){   
  const value = "Value"
  const values = "Values" 
  const prefixValue = prefix[value]
  const prefixValues = prefix[values] 
  if(!(prefixValue === undefined) && 'conditionalView' in prefixValue && prefixValue['conditionalView'][1] === prefix.Type.value) {
    return loadCheck(prefix, value, fieldSpecifier)
  } else if(!(prefixValues === undefined) && 'conditionalView' in prefixValues && prefixValues['conditionalView'][1] === prefix.Type.value){
    return loadCheck(prefix, values, fieldSpecifier)
  } else if(!(prefixValue === undefined)){
    return loadCheck(prefix, value, fieldSpecifier)
  } else if(!(prefixValues === undefined)) {
    return loadCheck(prefix, values, fieldSpecifier)
  }
  return []
}

function checkForConditionalView(prefix, infoIn){
  if('conditionalView' in prefix){
    const conditionalViewPrefix = prefix['conditionalView']
    const setDataView = infoIn.data[conditionalViewPrefix[0]].value
    const setView = conditionalViewPrefix[1]
    if(setDataView != setView){ return true}
  }
  return false
}    

function automateValidation(prefix, key, dataPrefix, infoIn, fieldSpecifier) {   
  if(!('value' in prefix[key]) && prefix[key] instanceof Object){
    if(checkForConditionalView(prefix, infoIn)){return []}
    const keysIn = getKeys(prefix[key]) 
    if(key === 'conditionalView') {return []}
    return keysIn.flatMap(
      keyIn => automateValidation(prefix[key], keyIn, dataPrefix[key], infoIn, fieldSpecifier)
    )
  } else  if('value' in prefix[key] ){  
    if(checkForConditionalView(prefix, infoIn)){return []}
    if(key === 'Poissons Ratio'){
      return poissonsRatioCheck(dataPrefix, key)
    }
    if(!dataPrefix[key].value || dataPrefix[key].value === ""){
      return['Must specify '+key+' in '+ fieldSpecifier ]
    } 
  }
  return []
}
function validateModel(prefix){
  if(!prefix.geometry.body.fileName){
    return[' Must specify Model']
  }
}
  
export function validateScenario(scenario){
  const infoIn = scenario.modelviews
  const mainKeys = Object.keys(infoIn)
  let errors = []
  errors = errors.concat(validateModel(scenario))
  mainKeys.forEach(key => {
    const viewPrefix = infoIn[key].view
    const dataPrefix = infoIn[key].data
    const viewPrefixTemplate = viewPrefix['<Template>']
    if(!dataPrefix || (JSON.stringify(dataPrefix) === JSON.stringify({})) ||
      (getKeys(dataPrefix).length === 0 && dataPrefix.constructor === Object)||
      (dataPrefix.length == 0 && Array.isArray(dataPrefix))){
        errors.push('Must specify '+key)
    } else {
      if(viewPrefix.type === 'single-view'){      
        const subKeys = getKeys(viewPrefixTemplate)
        if(key === 'Problem' && dataPrefix.Constraint.value && dataPrefix.Objective.value){
          if(dataPrefix.Constraint.value === dataPrefix.Objective.value){
            errors = errors.concat(['Constraint and objective must not have the same value'])
          }
        }
        subKeys.forEach(subKey => {
          errors = errors.concat(automateValidation(viewPrefixTemplate, subKey, dataPrefix, infoIn[key], key))
        })  
      } else if(viewPrefix.type === 'list-view'){
        let subKeys = getKeys(viewPrefixTemplate)
        subKeys.forEach(subKey => {
          const userGeneratedFieldNames = getUserGeneratedFieldNames(dataPrefix)
          
          if(userGeneratedFieldNames.length > 0){
            for(var index in userGeneratedFieldNames){ 
              const userGeneratedFieldName = userGeneratedFieldNames[index]
              errors = errors.concat(
                automateValidation(viewPrefixTemplate
                , subKey, dataPrefix[index][userGeneratedFieldName]
                , infoIn[key], userGeneratedFieldName)
              )
              
              if(key.includes('Loads') && subKey === 'Value'){
                errors = errors.concat(isLoadZero(dataPrefix[index][userGeneratedFieldName], userGeneratedFieldName))
              }
            }
          }
        })
      } else if (viewPrefix.type === 'option-view'){
        const optionSet = getKeys(dataPrefix)[0]
        const optionInfo = viewPrefix['<Options>'][optionSet]
        let subKeys = getKeys(optionInfo)
        /*errors = subKeys.flatMap(subKey => 
          automateValidation(viewPrefix['<Options>'][optionSet], subKey, dataPrefix[optionSet], infoIn[key], key)
        ) */
        subKeys.forEach(subKey =>
          errors = errors.concat(automateValidation(optionInfo, subKey, dataPrefix[optionSet], infoIn[key], key))
        )       
      }
    } 
  })
  return errors
}

        