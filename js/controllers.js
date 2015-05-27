'use strict';

/* Controllers */

angular.module('Data', ['infinite-scroll'])


.controller('ActionButtons', ['$scope', 'SidewireData',
function($scope, SidewireData)
{
	
}])
.controller('UIController', ['$scope', 'SidewireData', 'Buttons', '$location','BrowseSearch','Validate', 
function($scope, SidewireData, Buttons, $location, BrowseSearch, Validate)
{
	$scope.loading=true;
	$scope.navButtons = [{name:'Sources', state:'off',type:'sources', href:'#/sources/table'}, {name:'Contexts', state:'off',type:'contexts', href:'#/contexts/table' }];
	$scope.viewButtons = [{name:'boxes', state:'off', type:'cards', href:'#'+$location.path().split('/')[1].split('/')[0]+'/cards'},{name:'list', state:'off', type:'table', href:'#'+ $location.path().split('/')[1].split('/')[0]+'/table'}];
	$scope.sortButtons=[{ name:'sort-alpha-desc', state:'off', type: 'asc'},{name:'sort-alpha-asc', state:'off', type:'dsc'}];
	$scope.datatype = $location.path().split('/')[1].split('/')[0];
	$scope.template = $location.path().split('/')[2].split('/')[0];
	$scope.holder=[];
	$scope.adder={contexts:[], sources:[], active:[]};
	
	
	if(jQuery.isEmptyObject($scope.data))
	{
		$scope.data = {contexts:[], sources:[], active:[]};
		SidewireData.getContextsData().then(function(data){
			$scope.data.contexts =data.data.contexts;
			$scope.data.contexts.forEach(function(item){
			$scope.data.contexts.httpThere=true;	
		
			var x= data.data.contexts.indexOf(item);
					if(x%2==0)
					{
						item.color = "blue";
					}
					else{
						item.color="gray"
					}	
			
			});
			SidewireData.getSourcesData().then(function(data){
				$scope.data.sources = data.data.sources;
				$scope.data.sources.forEach(function(item){
				var y= $scope.data.sources.indexOf(item);
				$scope.data.sources.httpThere=true;
					if(y%2==0)
					{
						item.color = "blue";
					}
					else{
						item.color="gray"
					}	
			
				});
				$scope.loading=false;
				$scope.data.active=$scope.data[$scope.datatype];
				
				///////////Deep copy so if you are editing a Card/Row and you click the close btn, it goes back to the original.///////////////
				
				 //$scope.holder=angular.copy($scope.data.active);
								
			});
		});
	}
	else{
		
			$scope.data.active=$scope.data[$scope.datatype];
			//$scope.holder = angular.copy($scope.data.active);
			
				
		}
	
	
	
	$scope.filterData =function(query, type){
		
		
		$scope.query=query;
		if(query.length==0  )
		{
			$scope.data.active= $scope.data[type]
			
		}
		else{
			BrowseSearch.SearchData($scope.data[type], query, 'feed_url').then(function(data){
			$scope.data.active = data.fullArr;
			
			});
			
		}
	};
	

	$scope.changeState = function(type){
		Buttons.changeButton($scope.navButtons, type);
		
	};
	$scope.controlViews = function(type)
	{
		Buttons.changeButton($scope.viewButtons, type);
	};
	$scope.controlSort=function(type)
	{
		Buttons.changeButton($scope.sortButtons, type);
	};
	$scope.controlSort=function(type,data)
	{
		Buttons.changeButton($scope.sortButtons, type);
		Buttons.changeOrder($scope.data[data], 'name', type, 'str')
	};
	$scope.changeCheck = function(property, id, arr)
	{
		if(arr[id][property] ==true)
		{
			arr[id][property]=false;
		}
		else{
			arr[id][property]=true
		}
	};
	$scope.addItem =function()
	{
		if($scope.datatype=='contexts')
		{
		$scope.adder[$scope.datatype].push({id:$scope.data.active.length+$scope.adder[$scope.datatype].length, name:'', domain:'', parser_class:'', pas:'', pas_std:'', twitter_handle:'', article_whitelist:false, twitter_whitelist:false, cdn_domains:'', httpThere:'', show:true});
		}
		else{
			
		$scope.adder[$scope.datatype].push({id:$scope.data.active.length+$scope.adder[$scope.datatype].length, name:'', domain:'',parser_class:'', cdn_domains:'', whitelist:false, show:true});
		
		}
		goToByScrollTop('row');
	};
	
	
	
	$scope.close = function(id)
	{
		$scope.adder[$scope.datatype][id].show=false;
		$scope.adder[$scope.datatype].splice(id, 1);
		
		$scope.adder[$scope.datatype].forEach(function(item){
			var index =$scope.adder[$scope.datatype].indexOf(item);
			item.id=$scope.data[$scope.datatype].length+index;
		});
		
		
	};
	
	$scope.deleteItem = function(index)
	{		
			var index =index;
			if(localStorage.deleted!=null)
			{
				var deleted =jQuery.parseJSON(localStorage.deleted);
			}
			else{
				var deleted = []
			}
			deleted.push($scope.data.active[index])
			localStorage.deleted=JSON.stringify(deleted);
			$scope.data.active.splice(index, 1);
			$scope.data[$scope.datatype]=$scope.data.active;
			localStorage[$scope.datatype]=JSON.stringify($scope.data.active);
	};
	$scope.editItem = function(index,id)
	{	
		$scope.holder=[];
		$scope.data.active[index].Edit=true;
		$scope.data.active[index].httpThere=true;
		///////////deep copy of the object////////////
		$scope.holder.push(angular.copy($scope.data.active[index]));
		};
	
	$scope.noEdit = function(index, id)
	{
	////////////changes data back to deep copy so the data doesn't change from what it was before edit box was opened//////////////
	$scope.holder.forEach(function(item){
		
		
		if((item.id)==(id))
		{
			$scope.data.active[index]= item;
			$scope.data.active[index].Edit=false;
		}
	});
	
	
	};
	
	$scope.savItem=function(id,type){
		
		
		if(type=='new')
		{
			///////////////////NEED TO ADD VALIDATION to make sure field are filled out i.e. that values do not == ''//////////////////
			Validate.isEmpty($scope.adder[$scope.datatype][id]).then(function(data){
				if(data==true){
					alert('Please fill out all fields');
				}
				else{
					Validate.hasHTTP($scope.adder[$scope.datatype][id].feed_url).then(function(data){
					if(data==true)
					{						
					if(id%2==0)
						{
							$scope.adder[$scope.datatype][id].color='blue'
						}
						else{
							$scope.adder[$scope.datatype][id].color='gray'
						}
						$scope.data.active.push($scope.adder[$scope.datatype][id]);
						localStorage.setItem($scope.datatype, JSON.stringify($scope.data.active));
						$scope.runPost($scope.data);	
						$scope.close(id);
						
					}
					else{
						alert('Please make sure you are using a valid web address that includes http:// or https://')
					}
				});
				}
				
			});
			
		}
		else{
			Validate.hasHTTP($scope.data.active[id].feed_url).then(function(data){
					if(data==true)
					{						
						$scope.data.active[id].Edit=false;
						$scope.runPost($scope.data);	
					}
					else{
						alert('Please make sure you are using a valid web address that includes http:// or https://')
					}
				});
			
			
		}
		
	};	
	
	
	$scope.runPost=function(data)
	{
		
		////////////Adds full data (sources and contexts) to localStorage object called data//////////
		localStorage.setItem('data', JSON.stringify($scope.data));
		/////example post to local php file; responds with data in console////////
		SidewireData.runPost(data);
	};
	


	
	$scope.codeToggle=function(){
		if($scope.showJSON==false || $scope.showJSON==undefined)
		{
		$scope.showJSON=true;
		}else
		{
			$scope.showJSON=false;
		}
	};
	$scope.createDomain=function(str,obj)
	{
		if(str!=undefined)
		{
			if(str.match('http://')){
			str= str.split('http://')[1];
				if(str.match('.com'))
				{
					
					var index= str.indexOf('.com')+4;
					
				}
				else if(str.match('.org'))
				{
					var index= str.indexOf('.org')+4
				}	
				else if(str.indexOf('.gov'))
				{
					var index= str.indexOf('.gov')+4
				}
				else{
					var index= str.length;
				}
		
			str = str.slice(0,index)
			console.log(str)
			obj.domain=str;
			}
		}
	};
	$scope.createParserClass=function(item)
	{
		
		item.parser_class=item.name.toLowerCase().replace(/ /g, '_')+'_parser.'+item.name.toUpperCase()+'Parser';
	};
	$scope.checkInput = function(str, id, obj){
		Validate.hasHTTP(str).then(function(data){
			obj[id].httpThere=data;
		});
		
		
	};
		$scope.changeState($scope.datatype);
		$scope.controlViews($scope.template)
	
	
}]);
