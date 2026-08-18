function valid_parenthesis(str){
    let stack = []
    let pairs = {
        ')':'(',
        ']':'[',
        '}':'{'
    };

    for(let i=0; i<str.length; i++){
        if(str[i]=='(' || str[i]=='[' || str[i]=='{'){
            stack.push(str[i]);
        }
        else{
            if(stack.length==0){
                return false
            }
            let top=stack.pop();
            if(pairs[str[i]] != top){
                return false;
            }
        }
    }
    if(stack.length == 0){
        return true;
    }
    else{
        return false;
    }
}

console.log(valid_parenthesis("()[]({{}"))
console.log(valid_parenthesis("(]"))




// function check_anagram(str1, str2){
//     if(str1.length != str2.length){
//         return false
//     }

//     let occurance = new Map()
    
//     for(let i=0; i<str1.length; i++){
//         occurance[str1[i]] = (occurance[str1[i]] || 0)+1;
//     }
//     console.log(occurance)
//     for(let char of str2){
//         if(!occurance[char]){
//             return false;
//         }
//         occurance[char]--;
//     }
//     console.log(occurance)
//     return true;
// }

// console.log(check_anagram("listen", "silent"));

// function check_anagram(str1, str2){
//     if(str1.length !== str2.length){
//         return false;
//     }
//     let sortedStr1 = str1.split('').sort().join('');
//     let sortedStr2 = str2.split('').sort().join('');
//     return sortedStr1 === sortedStr2;
// }

// console.log(check_anagram("listen", "silent"));




// function subarray_sum(arr,k){
//     let sum=0
//     let max_sum=0

//     for(let i=0; i<k; i++){
//         sum+=arr[i]
//     }
//     max_sum= sum;

//     // console.log(sum)

//     for(let i=k; i <arr.length; i++){
//         let current_sum = arr[i-k]
//         sum += arr[i]-current_sum;
//         if(sum > max_sum){
//             max_sum=sum;
//         }
//     }
//     return max_sum;
// }

// console.log(subarray_sum([1,2,3,4,5,6,7,8,9,10],4))




// function contains_duplicate(arr){
//     let duplicate= []

//     for(let num of arr){
//         if(duplicate.includes(num)){
//             return true;
//         }
//         duplicate.push(num);
//     }
//     return false;
// }

// console.log(contains_duplicate([1,2,3,4,5,6,7,8,9,10]));
// console.log(contains_duplicate([1,2,3,4,5,6,7,8,9,9]));


// function max_profit(prices){
//     let min_price= Infinity
//     let max_profit=0;

//     for(let price of prices){
//         if(price< min_price){
//             min_price=price;
//         }
//         let profit=price-min_price;
//         if(profit> max_profit){
//             max_profit=profit;
//         }
//     }
//     return max_profit;
// }

// let prices=[7,1,5,3,6,4];
// console.log(max_profit(prices));